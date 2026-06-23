const { query, pool } = require('../config/database');
const AppError = require('../utils/AppError');
const { formatResponse } = require('../utils/helpers');
const { calculateWorkingDays } = require('../utils/workingDays');

class LeaveController {
  static async create(req, res, next) {
    try {
      const { employeeId, leaveType, startDate, endDate, reason } = req.body;
      const totalDays = calculateWorkingDays(startDate, endDate);
      if (totalDays <= 0) throw new AppError('Invalid date range', 400);

      const balance = await query(
        `SELECT remaining_days FROM leave_balances WHERE employee_id = $1 AND leave_type = $2 AND year = $3`,
        [employeeId, leaveType, new Date().getFullYear()]
      );
      if (balance.rows.length && balance.rows[0].remaining_days < totalDays) {
        throw new AppError(`Insufficient ${leaveType} leave balance. Available: ${balance.rows[0].remaining_days}, Requested: ${totalDays}`, 400);
      }

      const result = await query(
        `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, total_days, reason, status)
         VALUES ($1,$2,$3,$4,$5,$6,'pending') RETURNING *`,
        [employeeId, leaveType, startDate, endDate, totalDays, reason]
      );
      res.status(201).json(formatResponse(result.rows[0]));
    } catch (err) { next(err); }
  }

  static async approve(req, res, next) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const request = await client.query('SELECT * FROM leave_requests WHERE id = $1 AND status = $2', [req.params.id, 'pending']);
      if (!request.rows.length) throw new AppError('Leave request not found or already processed', 404);

      const lr = request.rows[0];
      await client.query(`UPDATE leave_requests SET status = 'approved', reviewed_by = $1, review_notes = $2, updated_at = NOW() WHERE id = $3`, [req.user?.id || 1, req.body.notes || '', req.params.id]);

      const year = new Date().getFullYear();
      const existing = await client.query('SELECT id FROM leave_balances WHERE employee_id=$1 AND leave_type=$2 AND year=$3', [lr.employee_id, lr.leave_type, year]);
      if (existing.rows.length) {
        await client.query('UPDATE leave_balances SET used_days = used_days + $1, remaining_days = remaining_days - $1 WHERE employee_id=$2 AND leave_type=$3 AND year=$4', [lr.total_days, lr.employee_id, lr.leave_type, year]);
      }

      await client.query('COMMIT');
      res.json(formatResponse({ message: 'Leave request approved' }));
    } catch (err) { await client.query('ROLLBACK'); next(err); }
    finally { client.release(); }
  }

  static async reject(req, res, next) {
    try {
      const result = await query(
        `UPDATE leave_requests SET status = 'rejected', reviewed_by = $1, review_notes = $2, updated_at = NOW() WHERE id = $3 AND status = 'pending' RETURNING *`,
        [req.user?.id || 1, req.body.notes || '', req.params.id]
      );
      if (!result.rows.length) throw new AppError('Leave request not found or already processed', 404);
      res.json(formatResponse(result.rows[0]));
    } catch (err) { next(err); }
  }

  static async cancel(req, res, next) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const request = await client.query('SELECT * FROM leave_requests WHERE id = $1', [req.params.id]);
      if (!request.rows.length) throw new AppError('Leave request not found', 404);
      const lr = request.rows[0];
      if (lr.status === 'approved') {
        await client.query('UPDATE leave_balances SET used_days = used_days - $1, remaining_days = remaining_days + $1 WHERE employee_id=$2 AND leave_type=$3 AND year=$4', [lr.total_days, lr.employee_id, lr.leave_type, new Date().getFullYear()]);
      }
      await client.query(`UPDATE leave_requests SET status = 'cancelled', updated_at = NOW() WHERE id = $1`, [req.params.id]);
      await client.query('COMMIT');
      res.json(formatResponse({ message: 'Leave request cancelled' }));
    } catch (err) { await client.query('ROLLBACK'); next(err); }
    finally { client.release(); }
  }

  static async getByEmployee(req, res, next) {
    try {
      const result = await query('SELECT * FROM leave_requests WHERE employee_id = $1 ORDER BY created_at DESC', [req.params.employeeId]);
      res.json(formatResponse(result.rows));
    } catch (err) { next(err); }
  }

  static async getPending(req, res, next) {
    try {
      const result = await query(
        `SELECT lr.*, e.first_name, e.last_name, e.employee_number FROM leave_requests lr
         JOIN employees e ON lr.employee_id = e.id WHERE lr.status = 'pending' ORDER BY lr.created_at`
      );
      res.json(formatResponse(result.rows));
    } catch (err) { next(err); }
  }
}
module.exports = LeaveController;
