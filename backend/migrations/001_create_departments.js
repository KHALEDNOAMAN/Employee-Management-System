exports.up = function(knex) {
  return knex.schema.createTable('departments', (t) => {
    t.increments('id').primary(); t.string('name', 100).notNullable(); t.string('code', 20).unique().notNullable();
    t.text('description'); t.integer('parent_id').references('id').inTable('departments'); t.integer('manager_id');
    t.decimal('budget', 15, 2).defaultTo(0); t.boolean('is_active').defaultTo(true); t.timestamps(true, true);
  });
};
exports.down = (knex) => knex.schema.dropTable('departments');
