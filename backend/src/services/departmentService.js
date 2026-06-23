const { query, getClient } = require('../config/database');
const AppError = require('../utils/AppError');

class DepartmentService {
  /**
   * Get all departments with employee count and manager info
   */
  async getAll() {
    const result = await query(
      `SELECT
        d.*,
        p.name AS parent_name,
        CONCAT(m.first_name, ' ', m.last_name) AS manager_name,
        COUNT(DISTINCT e.id) AS employee_count
      FROM departments d
      LEFT JOIN departments p ON d.parent_id = p.id
      LEFT JOIN employees m ON d.manager_id = m.id
      LEFT JOIN employees e ON e.department_id = d.id AND e.deleted_at IS NULL
      WHERE d.is_active = true
      GROUP BY d.id, p.name, m.first_name, m.last_name
      ORDER BY d.name ASC`
    );
    return result.rows;
  }

  /**
   * Get a single department by ID with details
   */
  async getById(id) {
    const result = await query(
      `SELECT
        d.*,
        p.name AS parent_name,
        CONCAT(m.first_name, ' ', m.last_name) AS manager_name,
        COUNT(DISTINCT e.id) AS employee_count
      FROM departments d
      LEFT JOIN departments p ON d.parent_id = p.id
      LEFT JOIN employees m ON d.manager_id = m.id
      LEFT JOIN employees e ON e.department_id = d.id AND e.deleted_at IS NULL
      WHERE d.id = $1
      GROUP BY d.id, p.name, m.first_name, m.last_name`,
      [id]
    );

    if (result.rows.length === 0) {
      throw AppError.notFound('Department');
    }

    // Get employees in this department
    const employees = await query(
      `SELECT id, employee_number, first_name, last_name, email,
              employment_status, avatar_url
       FROM employees
       WHERE department_id = $1 AND deleted_at IS NULL
       ORDER BY first_name ASC`,
      [id]
    );

    return {
      ...result.rows[0],
      employees: employees.rows,
    };
  }

  /**
   * Get department hierarchy as a tree using recursive CTE
   */
  async getTree() {
    const result = await query(
      `WITH RECURSIVE dept_tree AS (
        -- Base case: root departments (no parent)
        SELECT
          d.id, d.name, d.code, d.description, d.parent_id,
          d.manager_id, d.budget, d.is_active,
          0 AS depth,
          ARRAY[d.id] AS path,
          CONCAT(m.first_name, ' ', m.last_name) AS manager_name
        FROM departments d
        LEFT JOIN employees m ON d.manager_id = m.id
        WHERE d.parent_id IS NULL AND d.is_active = true

        UNION ALL

        -- Recursive case: child departments
        SELECT
          d.id, d.name, d.code, d.description, d.parent_id,
          d.manager_id, d.budget, d.is_active,
          dt.depth + 1 AS depth,
          dt.path || d.id AS path,
          CONCAT(m.first_name, ' ', m.last_name) AS manager_name
        FROM departments d
        INNER JOIN dept_tree dt ON d.parent_id = dt.id
        LEFT JOIN employees m ON d.manager_id = m.id
        WHERE d.is_active = true
      )
      SELECT
        dt.*,
        (SELECT COUNT(*) FROM employees e
         WHERE e.department_id = dt.id AND e.deleted_at IS NULL) AS employee_count
      FROM dept_tree dt
      ORDER BY dt.path`
    );

    // Build nested tree structure
    return this._buildTree(result.rows);
  }

  /**
   * Build a nested tree from flat rows
   */
  _buildTree(rows) {
    const map = {};
    const roots = [];

    // Create map of id -> node
    rows.forEach((row) => {
      map[row.id] = {
        ...row,
        children: [],
      };
    });

    // Build parent-child relationships
    rows.forEach((row) => {
      if (row.parent_id && map[row.parent_id]) {
        map[row.parent_id].children.push(map[row.id]);
      } else {
        roots.push(map[row.id]);
      }
    });

    return roots;
  }

  /**
   * Create a new department
   */
  async create(data) {
    // Check for circular reference if parent_id is set
    if (data.parent_id) {
      const parentExists = await query(
        `SELECT id FROM departments WHERE id = $1 AND is_active = true`,
        [data.parent_id]
      );
      if (parentExists.rows.length === 0) {
        throw AppError.badRequest('Parent department does not exist.');
      }
    }

    // Check unique code
    const codeExists = await query(
      `SELECT id FROM departments WHERE code = $1`,
      [data.code]
    );
    if (codeExists.rows.length > 0) {
      throw AppError.conflict(`Department code "${data.code}" already exists.`);
    }

    const result = await query(
      `INSERT INTO departments (name, code, description, parent_id, manager_id, budget)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.name, data.code, data.description, data.parent_id, data.manager_id, data.budget]
    );

    return result.rows[0];
  }

  /**
   * Update a department
   */
  async update(id, data) {
    // Check for circular reference
    if (data.parent_id) {
      if (parseInt(data.parent_id) === parseInt(id)) {
        throw AppError.badRequest('A department cannot be its own parent.');
      }

      // Check that new parent is not a descendant of this department
      const descendants = await query(
        `WITH RECURSIVE desc_tree AS (
          SELECT id FROM departments WHERE parent_id = $1
          UNION ALL
          SELECT d.id FROM departments d
          INNER JOIN desc_tree dt ON d.parent_id = dt.id
        )
        SELECT id FROM desc_tree WHERE id = $2`,
        [id, data.parent_id]
      );

      if (descendants.rows.length > 0) {
        throw AppError.badRequest('Cannot set parent to a descendant department (circular reference).');
      }
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    const updatableFields = ['name', 'code', 'description', 'parent_id', 'manager_id', 'budget', 'is_active'];

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
      `UPDATE departments SET ${fields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw AppError.notFound('Department');
    }

    return result.rows[0];
  }

  /**
   * Soft delete a department (deactivate)
   */
  async softDelete(id) {
    // Check if department has active employees
    const empCheck = await query(
      `SELECT COUNT(*) as count FROM employees
       WHERE department_id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (parseInt(empCheck.rows[0].count) > 0) {
      throw AppError.badRequest(
        `Cannot delete department with ${empCheck.rows[0].count} active employee(s). Reassign them first.`
      );
    }

    const result = await query(
      `UPDATE departments SET is_active = false, updated_at = NOW()
       WHERE id = $1
       RETURNING id, name, code`,
      [id]
    );

    if (result.rows.length === 0) {
      throw AppError.notFound('Department');
    }

    return result.rows[0];
  }

  /**
   * Get department distribution (employee count per department)
   */
  async getDistribution() {
    const result = await query(
      `SELECT
        d.id, d.name, d.code,
        COUNT(e.id) AS employee_count,
        COALESCE(SUM(e.salary), 0) AS total_salary,
        COALESCE(AVG(e.salary), 0) AS avg_salary
      FROM departments d
      LEFT JOIN employees e ON e.department_id = d.id AND e.deleted_at IS NULL
      WHERE d.is_active = true
      GROUP BY d.id, d.name, d.code
      ORDER BY employee_count DESC`
    );
    return result.rows;
  }
}

module.exports = new DepartmentService();
