const { query } = require('../config/database');
const { formatResponse } = require('../utils/helpers');

class ReportController {
  static async summary(req, res, next) {
    try {
      const [headcount, departments, attendance, leave] = await Promise.all([
        query(`SELECT employment_status, COUNT(*) AS count FROM employees WHERE deleted_at IS NULL GROUP BY employment_status`),
        query(`SELECT d.name, COUNT(e.id) AS count FROM departments d LEFT JOIN employees e ON d.id = e.department_id AND e.deleted_at IS NULL WHERE d.is_active = true GROUP BY d.id, d.name ORDER BY count DESC`),
        query(`SELECT status, COUNT(*) AS count FROM attendance_records WHERE date = CURRENT_DATE GROUP BY status`),
        query(`SELECT status, COUNT(*) AS count FROM leave_requests WHERE created_at >= date_trunc('month', CURRENT_DATE) GROUP BY status`),
      ]);
      res.json(formatResponse({ headcount: headcount.rows, departments: departments.rows, todayAttendance: attendance.rows, monthlyLeave: leave.rows }));
    } catch (err) { next(err); }
  }

  static async departmentDistribution(req, res, next) {
    try {
      const result = await query(
        `SELECT d.name, d.budget, COUNT(e.id) AS employee_count, COALESCE(SUM(e.salary), 0) AS total_salary
         FROM departments d LEFT JOIN employees e ON d.id = e.department_id AND e.deleted_at IS NULL
         WHERE d.is_active = true GROUP BY d.id ORDER BY employee_count DESC`
      );
      res.json(formatResponse(result.rows));
    } catch (err) { next(err); }
  }

  static async attendanceRate(req, res, next) {
    try {
      const result = await query(
        `SELECT date, COUNT(*) FILTER (WHERE status = 'present') AS present, COUNT(*) FILTER (WHERE status = 'absent') AS absent,
          COUNT(*) FILTER (WHERE status = 'late') AS late, COUNT(*) AS total
         FROM attendance_records WHERE date >= CURRENT_DATE - INTERVAL '30 days' GROUP BY date ORDER BY date`
      );
      res.json(formatResponse(result.rows));
    } catch (err) { next(err); }
  }
}
module.exports = ReportController;
