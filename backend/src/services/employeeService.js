const { query, getClient } = require('../config/database');
const AppError = require('../utils/AppError');
const { generateEmployeeNumber } = require('../utils/helpers');

class EmployeeService {
  /**
   * Get all employees with search, filters, and pagination
   */
  async getAll({ search, department, status, type, page, limit, offset, sortBy, sortOrder }) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    // Always exclude soft-deleted
    conditions.push('e.deleted_at IS NULL');

    // Search by name, email, or employee number
    if (search) {
      conditions.push(`(
        e.first_name ILIKE $${paramIndex}
        OR e.last_name ILIKE $${paramIndex}
        OR e.email ILIKE $${paramIndex}
        OR e.employee_number ILIKE $${paramIndex}
        OR CONCAT(e.first_name, ' ', e.last_name) ILIKE $${paramIndex}
      )`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    // Filter by department
    if (department) {
      conditions.push(`e.department_id = $${paramIndex}`);
      values.push(department);
      paramIndex++;
    }

    // Filter by employment status
    if (status) {
      conditions.push(`e.employment_status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    // Filter by employment type
    if (type) {
      conditions.push(`e.employment_type = $${paramIndex}`);
      values.push(type);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total matching records
    const countResult = await query(
      `SELECT COUNT(*) as total FROM employees e ${whereClause}`,
      values
    );
    const totalCount = parseInt(countResult.rows[0].total, 10);

    // Fetch paginated results with joins
    const dataResult = await query(
      `SELECT
        e.id, e.employee_number, e.first_name, e.last_name, e.email, e.phone,
        e.date_of_birth, e.gender, e.department_id, e.position_id,
        e.hire_date, e.employment_type, e.employment_status, e.salary,
        e.avatar_url, e.city, e.created_at, e.updated_at,
        d.name AS department_name,
        p.title AS position_title,
        CONCAT(m.first_name, ' ', m.last_name) AS manager_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      LEFT JOIN employees m ON e.manager_id = m.id
      ${whereClause}
      ORDER BY e.${sortBy} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...values, limit, offset]
    );

    return { employees: dataResult.rows, totalCount };
  }

  /**
   * Get a single employee by ID with full details
   */
  async getById(id) {
    const result = await query(
      `SELECT
        e.*,
        d.name AS department_name,
        d.code AS department_code,
        p.title AS position_title,
        p.pay_grade,
        CONCAT(m.first_name, ' ', m.last_name) AS manager_name,
        m.email AS manager_email
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      LEFT JOIN employees m ON e.manager_id = m.id
      WHERE e.id = $1 AND e.deleted_at IS NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      throw AppError.notFound('Employee');
    }

    return result.rows[0];
  }

  /**
   * Create a new employee
   */
  async create(data) {
    const client = await getClient();

    try {
      await client.query('BEGIN');

      // Get next employee number
      const seqResult = await client.query(
        `SELECT COUNT(*) + 1 AS next_num FROM employees`
      );
      const employeeNumber = generateEmployeeNumber(parseInt(seqResult.rows[0].next_num, 10));

      const result = await client.query(
        `INSERT INTO employees (
          employee_number, first_name, last_name, email, phone,
          date_of_birth, gender, national_id, department_id, position_id,
          hire_date, employment_type, employment_status, salary,
          manager_id, address, city,
          emergency_contact_name, emergency_contact_phone
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
        RETURNING *`,
        [
          employeeNumber, data.first_name, data.last_name, data.email, data.phone,
          data.date_of_birth, data.gender, data.national_id, data.department_id, data.position_id,
          data.hire_date, data.employment_type, data.employment_status || 'active', data.salary,
          data.manager_id, data.address, data.city,
          data.emergency_contact_name, data.emergency_contact_phone,
        ]
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update an existing employee
   */
  async update(id, data) {
    // Build dynamic SET clause
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const updatableFields = [
      'first_name', 'last_name', 'email', 'phone', 'date_of_birth', 'gender',
      'national_id', 'department_id', 'position_id', 'hire_date', 'employment_type',
      'employment_status', 'salary', 'manager_id', 'avatar_url', 'address', 'city',
      'emergency_contact_name', 'emergency_contact_phone',
    ];

    for (const field of updatableFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${paramIndex}`);
        values.push(data[field]);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      throw AppError.badRequest('No valid fields to update.');
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE employees SET ${fields.join(', ')}
       WHERE id = $${paramIndex} AND deleted_at IS NULL
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw AppError.notFound('Employee');
    }

    return result.rows[0];
  }

  /**
   * Soft delete an employee by setting deleted_at
   */
  async softDelete(id) {
    const result = await query(
      `UPDATE employees SET deleted_at = NOW(), updated_at = NOW(),
       employment_status = 'terminated'
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, employee_number, first_name, last_name`,
      [id]
    );

    if (result.rows.length === 0) {
      throw AppError.notFound('Employee');
    }

    return result.rows[0];
  }

  /**
   * Update employee avatar URL
   */
  async updateAvatar(id, avatarUrl) {
    const result = await query(
      `UPDATE employees SET avatar_url = $1, updated_at = NOW()
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING id, avatar_url`,
      [avatarUrl, id]
    );

    if (result.rows.length === 0) {
      throw AppError.notFound('Employee');
    }

    return result.rows[0];
  }

  /**
   * Get employee count by status
   */
  async getCountByStatus() {
    const result = await query(
      `SELECT employment_status, COUNT(*) as count
       FROM employees WHERE deleted_at IS NULL
       GROUP BY employment_status`
    );
    return result.rows;
  }

  /**
   * Get recent hires (last 30 days)
   */
  async getRecentHires(limit = 5) {
    const result = await query(
      `SELECT e.id, e.employee_number, e.first_name, e.last_name,
              e.hire_date, e.avatar_url, d.name AS department_name,
              p.title AS position_title
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN positions p ON e.position_id = p.id
       WHERE e.deleted_at IS NULL
       ORDER BY e.hire_date DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }
}

module.exports = new EmployeeService();
