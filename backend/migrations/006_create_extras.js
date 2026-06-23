exports.up = function(knex) {
  return knex.schema
    .createTable('salary_history', (t) => {
      t.increments('id').primary(); t.integer('employee_id').notNullable().references('id').inTable('employees');
      t.decimal('old_salary', 12, 2); t.decimal('new_salary', 12, 2); t.date('effective_date');
      t.text('reason'); t.integer('changed_by'); t.timestamps(true, true);
    })
    .createTable('employee_documents', (t) => {
      t.increments('id').primary(); t.integer('employee_id').notNullable().references('id').inTable('employees');
      t.string('document_type', 50); t.string('file_name', 255); t.string('file_path', 500);
      t.integer('file_size'); t.text('notes'); t.timestamps(true, true);
    })
    .createTable('employee_notes', (t) => {
      t.increments('id').primary(); t.integer('employee_id').notNullable().references('id').inTable('employees');
      t.integer('author_id').references('id').inTable('employees');
      t.text('content').notNullable(); t.timestamps(true, true);
    });
};
exports.down = function(knex) {
  return knex.schema.dropTable('employee_notes').dropTable('employee_documents').dropTable('salary_history');
};
