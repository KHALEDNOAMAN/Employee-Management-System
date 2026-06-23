exports.up = function(knex) {
  return knex.schema.raw(`CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'half_day', 'late', 'remote')`)
    .createTable('attendance_records', (t) => {
      t.increments('id').primary(); t.integer('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
      t.date('date').notNullable(); t.timestamp('check_in_time'); t.timestamp('check_out_time');
      t.specificType('status', 'attendance_status').defaultTo('present');
      t.decimal('total_hours', 5, 2); t.text('notes');
      t.unique(['employee_id', 'date']); t.timestamps(true, true);
    }).then(() => knex.raw('CREATE INDEX idx_attendance_date ON attendance_records(date)'));
};
exports.down = function(knex) {
  return knex.schema.dropTable('attendance_records').raw('DROP TYPE IF EXISTS attendance_status');
};
