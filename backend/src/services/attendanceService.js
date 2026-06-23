const { query } = require('../config/database');
const AppError = require('../utils/AppError');

class AttendanceService {
  /**
   * Record employee check-in
   */
  async checkIn({ employee_id, notes }) {
    const today = new Date().toISOString().split('T')[0];

    // Check if already checked in today
    const existing = await query(
      `SELECT id, check_in_time FROM attendance_records
       WHERE employee_id = $1 AND date = $2`,
      [employee_id, today]
    );

    if (existing.rows.length > 0) {
      throw AppError.conflict(
        `Employee already checked in today at ${existing.rows[0].check_in_time}`
      );
    }

    // Verify employee exists and is active
    const employee = await query(
      `SELECT id, first_name, last_name FROM employees
       WHERE id = $1 AND deleted_at IS NULL AND employment_status = 'active'`,
      [employee_id]
    );

    if (employee.rows.length === 0) {
      throw AppError.notFound('Active employee');
    }

    const now = new Date();
    const checkInHour = now.getHours();

    // Determine attendance status based on check-in time
    let status = 'present';
    if (checkInHour >= 10) {
      status = 'late';
    }

    const result = await query(
      `INSERT INTO attendance_records (employee_id, date, check_in_time, status, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [employee_id, today, now.toISOString(), status, notes || null]
    );

    return {
      ...result.rows[0],
      employee_name: `${employee.rows[0].first_name} ${employee.rows[0].last_name}`,
    };
  }

  /**
   * Record employee check-out and calculate total hours
   */
  async checkOut({ employee_id, notes }) {
    const today = new Date().toISOString().split('T')[0];

    // Find today's check-in record
    const existing = await query(
      `SELECT id, check_in_time, check_out_time FROM attendance_records
       WHERE employee_id = $1 AND date = $2`,
      [employee_id, today]
    );

    if (existing.rows.length === 0) {
      throw AppError.badRequest('No check-in record found for today. Please check in first.');
    }

    if (existing.rows[0].check_out_time) {
      throw AppError.conflict('Already checked out today.');
    }

    const now = new Date();
    const checkInTime = new Date(existing.rows[0].check_in_time);
    const totalHours = ((now - checkInTime) / (1000 * 60 * 60)).toFixed(2);

    // Determine if it was a half day
    let status = existing.rows[0].status || 'present';
    if (parseFloat(totalHours) < 4) {
      status = 'half_day';
    }

    const result = await query(
      `UPDATE attendance_records
       SET check_out_time = $1, total_hours = $2, status = $3,
           notes = COALESCE($4, notes)
       WHERE id = $5
       RETURNING *`,
      [now.toISOString(), totalHours, status, notes, existing.rows[0].id]
    );

    return result.rows[0];
  }

  /**
   * Get attendance records for an employee with optional date range
   */
  async getByEmployee(employeeId, { startDate, endDate, month, year }) {
    const conditions = ['ar.employee_id = $1'];
    const values = [employeeId];
    let paramIndex = 2;

    if (startDate && endDate) {
      conditions.push(`ar.date >= $${paramIndex} AND ar.date <= $${paramIndex + 1}`);
      values.push(startDate, endDate);
      paramIndex += 2;
    } else if (month && year) {
      conditions.push(`EXTRACT(MONTH FROM ar.date) = $${paramIndex}`);
      conditions.push(`EXTRACT(YEAR FROM ar.date) = $${paramIndex + 1}`);
      values.push(month, year);
      paramIndex += 2;
    }

    const result = await query(
      `SELECT
        ar.*,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name
      FROM attendance_records ar
      JOIN employees e ON ar.employee_id = e.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY ar.date DESC`,
      values
    );

    return result.rows;
  }

  /**
   * Get daily attendance summary for all employees
   */
  async getDailySummary(date) {
    const targetDate = date || new Date().toISOString().split('T')[0];

    const result = await query(
      `SELECT
        COUNT(DISTINCT e.id) AS total_employees,
        COUNT(DISTINCT ar.employee_id) FILTER (WHERE ar.status = 'present') AS present,
        COUNT(DISTINCT ar.employee_id) FILTER (WHERE ar.status = 'late') AS late,
        COUNT(DISTINCT ar.employee_id) FILTER (WHERE ar.status = 'half_day') AS half_day,
        COUNT(DISTINCT ar.employee_id) FILTER (WHERE ar.status = 'on_leave') AS on_leave,
        COUNT(DISTINCT ar.employee_id) FILTER (WHERE ar.status = 'remote') AS remote,
        ROUND(AVG(ar.total_hours)::numeric, 2) AS avg_hours
      FROM employees e
      LEFT JOIN attendance_records ar ON e.id = ar.employee_id AND ar.date = $1
      WHERE e.deleted_at IS NULL AND e.employment_status = 'active'`,
      [targetDate]
    );

    const summary = result.rows[0];
    const totalActive = parseInt(summary.total_employees);
    const totalPresent = parseInt(summary.present) + parseInt(summary.late) +
                         parseInt(summary.half_day) + parseInt(summary.remote);
    const absent = totalActive - totalPresent - parseInt(summary.on_leave);

    return {
      date: targetDate,
      total_employees: totalActive,
      present: parseInt(summary.present),
      late: parseInt(summary.late),
      half_day: parseInt(summary.half_day),
      on_leave: parseInt(summary.on_leave),
      remote: parseInt(summary.remote),
      absent: Math.max(0, absent),
      avg_hours: parseFloat(summary.avg_hours) || 0,
      attendance_rate: totalActive > 0
        ? ((totalPresent / totalActive) * 100).toFixed(1)
        : 0,
    };
  }

  /**
   * Get monthly attendance rate over time
   */
  async getMonthlyRates(months = 6) {
    const result = await query(
      `SELECT
        TO_CHAR(ar.date, 'YYYY-MM') AS month,
        COUNT(DISTINCT ar.employee_id) FILTER (WHERE ar.status IN ('present', 'late', 'remote')) AS present_days,
        COUNT(*) AS total_records,
        ROUND(
          COUNT(DISTINCT ar.employee_id) FILTER (WHERE ar.status IN ('present', 'late', 'remote'))::numeric /
          NULLIF(COUNT(*)::numeric, 0) * 100, 1
        ) AS attendance_rate
      FROM attendance_records ar
      WHERE ar.date >= (CURRENT_DATE - INTERVAL '${months} months')
      GROUP BY TO_CHAR(ar.date, 'YYYY-MM')
      ORDER BY month ASC`
    );
    return result.rows;
  }
}

module.exports = new AttendanceService();
