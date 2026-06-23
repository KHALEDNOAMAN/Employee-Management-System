exports.up = function(knex) {
  return knex.schema.raw(`CREATE TYPE gender_type AS ENUM ('male', 'female', 'other')`)
    .raw(`CREATE TYPE employment_type AS ENUM ('full_time', 'part_time', 'contract', 'intern')`)
    .raw(`CREATE TYPE employment_status AS ENUM ('active', 'on_leave', 'terminated', 'resigned')`)
    .createTable('employees', (t) => {
      t.increments('id').primary(); t.string('employee_number', 20).unique().notNullable();
      t.string('first_name', 50).notNullable(); t.string('last_name', 50).notNullable();
      t.string('email', 255).unique().notNullable(); t.string('phone', 20);
      t.date('date_of_birth'); t.specificType('gender', 'gender_type');
      t.string('national_id', 20).unique(); t.integer('department_id').references('id').inTable('departments');
      t.integer('position_id').references('id').inTable('positions');
      t.date('hire_date').notNullable(); t.specificType('employment_type', 'employment_type').defaultTo('full_time');
      t.specificType('employment_status', 'employment_status').defaultTo('active');
      t.decimal('salary', 12, 2).defaultTo(0); t.integer('manager_id').references('id').inTable('employees');
      t.string('avatar_url', 500); t.text('address'); t.string('city', 50);
      t.string('emergency_contact_name', 100); t.string('emergency_contact_phone', 20);
      t.timestamp('deleted_at'); t.timestamps(true, true);
    });
};
exports.down = function(knex) {
  return knex.schema.dropTable('employees').raw('DROP TYPE IF EXISTS employment_status').raw('DROP TYPE IF EXISTS employment_type').raw('DROP TYPE IF EXISTS gender_type');
};
