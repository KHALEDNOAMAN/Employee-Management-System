const { query, pool } = require('../config/database');
const AppError = require('../utils/AppError');
const { formatResponse } = require('../utils/helpers');

class AttendanceController {
  static async checkIn(req, res, next) {
    try {
      const { employeeId } = req.body;
      const today = new Date().toISOString().split('T')[0];
      const existing = await query('SELECT id FROM attendance_records WHERE employee_id = $1 AND date = $2', [employeeId, today]);
      if (existing.rows.length) throw new AppError('Already checked in today', 409);
      const result = await query(
        `INSERT INTO attendance_records (employee_id, date, check_in_time, status) VALUES ($1, $2, NOW(), 'present') RETURNING *`,
        [employeeId, today]
      );
      res.status(201).json(formatResponse(result.rows[0]));
    } catch (err) { next(err); }
  }

  static async checkOut(req, res, next) {
    try {
      const { employeeId } = req.body;
      const today = new Date().toISOString().split('T')[0];
      const record = await query('SELECT id, check_in_time FROM attendance_records WHERE employee_id = $1 AND date = $2', [employeeId, today]);
      if (!record.rows.length) throw new AppError('No check-in record found for today', 404);
      if (!record.rows[0].check_in_time) throw new AppError('Employee has not checked in', 400);
      const result = await query(
        `UPDATE attendance_records SET check_out_time = NOW(), total_hours = EXTRACT(EPOCH FROM (NOW() - check_in_time)) / 3600 WHERE id = $1 RETURNING *`,
        [record.rows[0].id]
      );
      res.json(formatResponse(result.rows[0]));
    } catch (err) { next(err); }
  }

  static async getByEmployee(req, res, next) {
    try {
      const { month, year } = req.query;
      let where = 'employee_id = $1';
      const params = [req.params.employeeId];
      if (month && year) { where += ` AND EXTRACT(MONTH FROM date) = $2 AND EXTRACT(YEAR FROM date) = $3`; params.push(month, year); }
      const result = await query(`SELECT * FROM attendance_records WHERE ${where} ORDER BY date DESC`, params);
      res.json(formatResponse(result.rows));
    } catch (err) { next(err); }
  }

  static async getDailySummary(req, res, next) {
    try {
      const date = req.query.date || new Date().toISOString().split('T')[0];
      const result = await query(
        `SELECT ar.*, e.first_name, e.last_name, e.employee_number FROM attendance_records ar
         JOIN employees e ON ar.employee_id = e.id WHERE ar.date = $1 ORDER BY ar.check_in_time`, [date]
      );
      const stats = await query(
        `SELECT status, COUNT(*) AS count FROM attendance_records WHERE date = $1 GROUP BY status`, [date]
      );
      res.json(formatResponse({ records: result.rows, stats: stats.rows, date }));
    } catch (err) { next(err); }
  }
}
module.exports = AttendanceController;
