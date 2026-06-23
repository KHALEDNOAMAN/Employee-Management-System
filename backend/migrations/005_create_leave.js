exports.up = function(knex) {
  return knex.schema
    .raw(`CREATE TYPE leave_type AS ENUM ('annual', 'sick', 'personal', 'maternity', 'paternity', 'unpaid')`)
    .raw(`CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled')`)
    .createTable('leave_requests', (t) => {
      t.increments('id').primary(); t.integer('employee_id').notNullable().references('id').inTable('employees');
      t.specificType('leave_type', 'leave_type').notNullable();
      t.date('start_date').notNullable(); t.date('end_date').notNullable();
      t.integer('total_days').notNullable(); t.text('reason');
      t.specificType('status', 'leave_status').defaultTo('pending');
      t.integer('reviewed_by').references('id').inTable('employees'); t.text('review_notes');
      t.timestamps(true, true);
    })
    .createTable('leave_balances', (t) => {
      t.increments('id').primary(); t.integer('employee_id').notNullable().references('id').inTable('employees');
      t.specificType('leave_type', 'leave_type').notNullable();
      t.integer('total_days').notNullable(); t.integer('used_days').defaultTo(0);
      t.integer('remaining_days').notNullable(); t.integer('year').notNullable();
      t.unique(['employee_id', 'leave_type', 'year']); t.timestamps(true, true);
    });
};
exports.down = function(knex) {
  return knex.schema.dropTable('leave_balances').dropTable('leave_requests').raw('DROP TYPE IF EXISTS leave_status').raw('DROP TYPE IF EXISTS leave_type');
};
