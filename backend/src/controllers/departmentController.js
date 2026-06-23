const { query } = require('../config/database');
const AppError = require('../utils/AppError');
const { formatResponse } = require('../utils/helpers');

class DepartmentController {
  static async getAll(req, res, next) {
    try {
      const result = await query(
        `SELECT d.*, (SELECT COUNT(*) FROM employees e WHERE e.department_id = d.id AND e.deleted_at IS NULL) AS employee_count
         FROM departments d WHERE d.is_active = true ORDER BY d.name`
      );
      res.json(formatResponse(result.rows));
    } catch (err) { next(err); }
  }

  static async getById(req, res, next) {
    try {
      const dept = await query('SELECT * FROM departments WHERE id = $1', [req.params.id]);
      if (!dept.rows.length) throw new AppError('Department not found', 404);
      const employees = await query(
        `SELECT id, employee_number, first_name, last_name, email, employment_status FROM employees WHERE department_id = $1 AND deleted_at IS NULL`, [req.params.id]
      );
      res.json(formatResponse({ ...dept.rows[0], employees: employees.rows }));
    } catch (err) { next(err); }
  }

  static async getTree(req, res, next) {
    try {
      const result = await query(
        `WITH RECURSIVE dept_tree AS (
          SELECT id, name, code, parent_id, 0 AS depth FROM departments WHERE parent_id IS NULL AND is_active = true
          UNION ALL
          SELECT d.id, d.name, d.code, d.parent_id, dt.depth + 1 FROM departments d JOIN dept_tree dt ON d.parent_id = dt.id WHERE d.is_active = true
        ) SELECT dt.*, (SELECT COUNT(*) FROM employees e WHERE e.department_id = dt.id AND e.deleted_at IS NULL) AS employee_count FROM dept_tree dt ORDER BY depth, name`
      );
      res.json(formatResponse(result.rows));
    } catch (err) { next(err); }
  }

  static async create(req, res, next) {
    try {
      const { name, code, description, parentId, budget } = req.body;
      const result = await query(
        'INSERT INTO departments (name, code, description, parent_id, budget) VALUES ($1,$2,$3,$4,$5) RETURNING *',
        [name, code, description, parentId, budget]
      );
      res.status(201).json(formatResponse(result.rows[0]));
    } catch (err) { next(err); }
  }

  static async update(req, res, next) {
    try {
      const { name, description, budget, parentId } = req.body;
      if (parentId && parseInt(parentId) === parseInt(req.params.id)) throw new AppError('Department cannot be its own parent', 400);
      const result = await query(
        'UPDATE departments SET name=COALESCE($1,name), description=COALESCE($2,description), budget=COALESCE($3,budget), parent_id=COALESCE($4,parent_id), updated_at=NOW() WHERE id=$5 RETURNING *',
        [name, description, budget, parentId, req.params.id]
      );
      if (!result.rows.length) throw new AppError('Department not found', 404);
      res.json(formatResponse(result.rows[0]));
    } catch (err) { next(err); }
  }
}
module.exports = DepartmentController;
