const { query, getClient } = require('../config/database');
const AppError = require('../utils/AppError');
const { calculateWorkingDays } = require('../utils/workingDays');

class LeaveService {
  /**
   * Create a leave request with balance validation
   */
  async createRequest(data) {
    const { employee_id, leave_type, start_date, end_date, reason } = data;

    // Verify employee exists
    const employee = await query(
      `SELECT id, first_name, last_name FROM employees
       WHERE id = $1 AND deleted_at IS NULL AND employment_status = 'active'`,
      [employee_id]
    );

    if (employee.rows.length === 0) {
      throw AppError.notFound('Active employee');
    }

    // Calculate total working days
    const totalDays = calculateWorkingDays(start_date, end_date);

    if (totalDays <= 0) {
      throw AppError.badRequest('Leave request must cover at least 1 working day.');
    }

    // Check leave balance
    const currentYear = new Date().getFullYear();
    const balance = await query(
      `SELECT * FROM leave_balances
       WHERE employee_id = $1 AND leave_type = $2 AND year = $3`,
      [employee_id, leave_type, currentYear]
    );

    if (balance.rows.length > 0) {
      const remaining = parseFloat(balance.rows[0].remaining_days);
      if (totalDays > remaining) {
        throw AppError.badRequest(
          `Insufficient leave balance. Requested: ${totalDays} days, Available: ${remaining} days.`
        );
      }
    }

    // Check for overlapping leave requests
    const overlap = await query(
      `SELECT id FROM leave_requests
       WHERE employee_id = $1
       AND status IN ('pending', 'approved')
       AND (
         (start_date <= $2 AND end_date >= $2)
         OR (start_date <= $3 AND end_date >= $3)
         OR (start_date >= $2 AND end_date <= $3)
       )`,
      [employee_id, start_date, end_date]
    );

    if (overlap.rows.length > 0) {
      throw AppError.conflict('You already have a leave request that overlaps with these dates.');
    }

    const result = await query(
      `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, total_days, reason)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [employee_id, leave_type, start_date, end_date, totalDays, reason]
    );

    return {
      ...result.rows[0],
      employee_name: `${employee.rows[0].first_name} ${employee.rows[0].last_name}`,
    };
  }

  /**
   * Approve a leave request - uses DB transaction to update balance atomically
   */
  async approve(requestId, reviewerId, reviewNotes) {
    const client = await getClient();

    try {
      await client.query('BEGIN');

      // Lock and fetch the leave request
      const request = await client.query(
        `SELECT * FROM leave_requests WHERE id = $1 AND status = 'pending' FOR UPDATE`,
        [requestId]
      );

      if (request.rows.length === 0) {
        throw AppError.notFound('Pending leave request');
      }

      const leaveRequest = request.rows[0];
      const currentYear = new Date(leaveRequest.start_date).getFullYear();

      // Update request status
      await client.query(
        `UPDATE leave_requests
         SET status = 'approved', reviewed_by = $1, review_notes = $2, updated_at = NOW()
         WHERE id = $3`,
        [reviewerId, reviewNotes, requestId]
      );

      // Update leave balance - decrement remaining and increment used
      const balanceUpdate = await client.query(
        `UPDATE leave_balances
         SET used_days = used_days + $1,
             remaining_days = remaining_days - $1
         WHERE employee_id = $2 AND leave_type = $3 AND year = $4
         RETURNING *`,
        [leaveRequest.total_days, leaveRequest.employee_id, leaveRequest.leave_type, currentYear]
      );

      // If no balance record exists, create one with the deduction
      if (balanceUpdate.rows.length === 0) {
        const { DEFAULT_LEAVE_BALANCES } = require('../config/constants');
        const totalForType = DEFAULT_LEAVE_BALANCES[leaveRequest.leave_type] || 0;

        await client.query(
          `INSERT INTO leave_balances (employee_id, leave_type, total_days, used_days, remaining_days, year)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            leaveRequest.employee_id, leaveRequest.leave_type,
            totalForType, leaveRequest.total_days,
            totalForType - leaveRequest.total_days, currentYear,
          ]
        );
      }

      await client.query('COMMIT');

      return { ...leaveRequest, status: 'approved', reviewed_by: reviewerId, review_notes: reviewNotes };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Reject a leave request
   */
  async reject(requestId, reviewerId, reviewNotes) {
    const result = await query(
      `UPDATE leave_requests
       SET status = 'rejected', reviewed_by = $1, review_notes = $2, updated_at = NOW()
       WHERE id = $3 AND status = 'pending'
       RETURNING *`,
      [reviewerId, reviewNotes, requestId]
    );

    if (result.rows.length === 0) {
      throw AppError.notFound('Pending leave request');
    }

    return result.rows[0];
  }

  /**
   * Cancel a leave request - restores balance if was approved
   */
  async cancel(requestId) {
    const client = await getClient();

    try {
      await client.query('BEGIN');

      const request = await client.query(
        `SELECT * FROM leave_requests WHERE id = $1 AND status IN ('pending', 'approved') FOR UPDATE`,
        [requestId]
      );

      if (request.rows.length === 0) {
        throw AppError.notFound('Active leave request');
      }

      const leaveRequest = request.rows[0];

      // If it was approved, restore the balance
      if (leaveRequest.status === 'approved') {
        const currentYear = new Date(leaveRequest.start_date).getFullYear();

        await client.query(
          `UPDATE leave_balances
           SET used_days = used_days - $1,
               remaining_days = remaining_days + $1
           WHERE employee_id = $2 AND leave_type = $3 AND year = $4`,
          [leaveRequest.total_days, leaveRequest.employee_id, leaveRequest.leave_type, currentYear]
        );
      }

      await client.query(
        `UPDATE leave_requests
         SET status = 'cancelled', updated_at = NOW()
         WHERE id = $1`,
        [requestId]
      );

      await client.query('COMMIT');

      return { ...leaveRequest, status: 'cancelled' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get leave requests for an employee
   */
  async getByEmployee(employeeId, { status, year } = {}) {
    const conditions = ['lr.employee_id = $1'];
    const values = [employeeId];
    let paramIndex = 2;

    if (status) {
      conditions.push(`lr.status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    if (year) {
      conditions.push(`EXTRACT(YEAR FROM lr.start_date) = $${paramIndex}`);
      values.push(year);
      paramIndex++;
    }

    const result = await query(
      `SELECT
        lr.*,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        CONCAT(r.first_name, ' ', r.last_name) AS reviewer_name
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      LEFT JOIN employees r ON lr.reviewed_by = r.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY lr.created_at DESC`,
      values
    );

    // Also fetch balances
    const currentYear = year || new Date().getFullYear();
    const balances = await query(
      `SELECT * FROM leave_balances
       WHERE employee_id = $1 AND year = $2`,
      [employeeId, currentYear]
    );

    return {
      requests: result.rows,
      balances: balances.rows,
    };
  }

  /**
   * Get all pending leave requests
   */
  async getPending() {
    const result = await query(
      `SELECT
        lr.*,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        e.employee_number,
        e.avatar_url,
        d.name AS department_name
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE lr.status = 'pending'
      ORDER BY lr.created_at ASC`
    );
    return result.rows;
  }

  /**
   * Get leave utilization summary
   */
  async getUtilization(year) {
    const targetYear = year || new Date().getFullYear();

    const result = await query(
      `SELECT
        leave_type,
        COUNT(*) AS total_requests,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved_count,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected_count,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
        SUM(CASE WHEN status = 'approved' THEN total_days ELSE 0 END) AS total_days_used
      FROM leave_requests
      WHERE EXTRACT(YEAR FROM start_date) = $1
      GROUP BY leave_type
      ORDER BY total_requests DESC`,
      [targetYear]
    );

    return result.rows;
  }
}

module.exports = new LeaveService();
