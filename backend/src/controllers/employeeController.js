const { query } = require('../config/database');
const AppError = require('../utils/AppError');
const { formatResponse, getPaginationParams, formatPaginationMeta } = require('../utils/helpers');

class EmployeeController {
  static async getAll(req, res, next) {
    try {
      const { page, perPage, offset } = getPaginationParams(req.query);
      const { search, department, status, type } = req.query;
      const conditions = ['e.deleted_at IS NULL'];
      const params = [];
      let idx = 1;

      if (search) { conditions.push(`(e.first_name ILIKE $${idx} OR e.last_name ILIKE $${idx} OR e.email ILIKE $${idx} OR e.employee_number ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
      if (department) { conditions.push(`e.department_id = $${idx++}`); params.push(department); }
      if (status) { conditions.push(`e.employment_status = $${idx++}`); params.push(status); }
      if (type) { conditions.push(`e.employment_type = $${idx++}`); params.push(type); }

      const where = conditions.join(' AND ');
      const countRes = await query(`SELECT COUNT(*) FROM employees e WHERE ${where}`, params);
      const total = parseInt(countRes.rows[0].count);

      const result = await query(
        `SELECT e.id, e.employee_number, e.first_name, e.last_name, e.email, e.phone,
          e.employment_type, e.employment_status, e.hire_date, e.salary, e.avatar_url,
          d.name AS department_name, p.title AS position_title
         FROM employees e
         LEFT JOIN departments d ON e.department_id = d.id
         LEFT JOIN positions p ON e.position_id = p.id
         WHERE ${where} ORDER BY e.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`,
        [...params, perPage, offset]
      );
      res.json(formatResponse(result.rows, { pagination: formatPaginationMeta(page, perPage, total) }));
    } catch (err) { next(err); }
  }

  static async getById(req, res, next) {
    try {
      const result = await query(
        `SELECT e.*, d.name AS department_name, p.title AS position_title,
          m.first_name AS manager_first, m.last_name AS manager_last
         FROM employees e
         LEFT JOIN departments d ON e.department_id = d.id
         LEFT JOIN positions p ON e.position_id = p.id
         LEFT JOIN employees m ON e.manager_id = m.id
         WHERE e.id = $1 AND e.deleted_at IS NULL`, [req.params.id]
      );
      if (!result.rows.length) throw new AppError('Employee not found', 404);
      res.json(formatResponse(result.rows[0]));
    } catch (err) { next(err); }
  }

  static async create(req, res, next) {
    try {
      const { firstName, lastName, email, phone, dateOfBirth, gender, nationalId, departmentId, positionId, hireDate, employmentType, salary, managerId, address, city, emergencyContactName, emergencyContactPhone } = req.body;
      const countRes = await query('SELECT COUNT(*) FROM employees WHERE EXTRACT(YEAR FROM hire_date) = $1', [new Date(hireDate).getFullYear()]);
      const seq = parseInt(countRes.rows[0].count) + 1;
      const employeeNumber = `EMP-${new Date(hireDate).getFullYear()}-${String(seq).padStart(3, '0')}`;

      const result = await query(
        `INSERT INTO employees (employee_number, first_name, last_name, email, phone, date_of_birth, gender, national_id, department_id, position_id, hire_date, employment_type, employment_status, salary, manager_id, address, city, emergency_contact_name, emergency_contact_phone)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'active',$13,$14,$15,$16,$17,$18) RETURNING *`,
        [employeeNumber, firstName, lastName, email, phone, dateOfBirth, gender, nationalId, departmentId, positionId, hireDate, employmentType || 'full_time', salary, managerId, address, city, emergencyContactName, emergencyContactPhone]
      );
      res.status(201).json(formatResponse(result.rows[0]));
    } catch (err) { next(err); }
  }

  static async update(req, res, next) {
    try {
      const fields = []; const values = []; let idx = 1;
      const allowed = ['first_name','last_name','email','phone','department_id','position_id','employment_type','employment_status','salary','manager_id','address','city'];
      const mapping = { firstName:'first_name', lastName:'last_name', departmentId:'department_id', positionId:'position_id', employmentType:'employment_type', employmentStatus:'employment_status', managerId:'manager_id' };
      for (const [key, val] of Object.entries(req.body)) {
        const col = mapping[key] || key;
        if (allowed.includes(col) && val !== undefined) { fields.push(`${col} = $${idx++}`); values.push(val); }
      }
      if (!fields.length) throw new AppError('No fields to update', 400);
      fields.push('updated_at = NOW()');
      values.push(req.params.id);
      const result = await query(`UPDATE employees SET ${fields.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`, values);
      if (!result.rows.length) throw new AppError('Employee not found', 404);
      res.json(formatResponse(result.rows[0]));
    } catch (err) { next(err); }
  }

  static async softDelete(req, res, next) {
    try {
      const result = await query('UPDATE employees SET deleted_at = NOW(), employment_status = $1 WHERE id = $2 AND deleted_at IS NULL RETURNING id', ['terminated', req.params.id]);
      if (!result.rows.length) throw new AppError('Employee not found', 404);
      res.json(formatResponse({ message: 'Employee archived successfully' }));
    } catch (err) { next(err); }
  }
}
module.exports = EmployeeController;
