exports.up = function(knex) {
  return knex.schema.createTable('positions', (t) => {
    t.increments('id').primary(); t.string('title', 100).notNullable(); t.text('description');
    t.decimal('min_salary', 12, 2); t.decimal('max_salary', 12, 2); t.string('pay_grade', 10);
    t.boolean('is_active').defaultTo(true); t.timestamps(true, true);
  });
};
exports.down = (knex) => knex.schema.dropTable('positions');
