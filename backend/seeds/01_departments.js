exports.seed = async function(knex) {
  await knex('departments').del();
  await knex('departments').insert([
    { id: 1, name: 'Technology', code: 'TECH', description: 'Engineering and development', budget: 2500000 },
    { id: 2, name: 'Frontend Development', code: 'TECH-FE', description: 'Frontend team', parent_id: 1, budget: 800000 },
    { id: 3, name: 'Backend Development', code: 'TECH-BE', description: 'Backend team', parent_id: 1, budget: 900000 },
    { id: 4, name: 'DevOps', code: 'TECH-DO', description: 'Infrastructure and deployment', parent_id: 1, budget: 500000 },
    { id: 5, name: 'Content', code: 'CONT', description: 'Content creation and management', budget: 600000 },
    { id: 6, name: 'Marketing', code: 'MRKT', description: 'Marketing and growth', budget: 800000 },
    { id: 7, name: 'Human Resources', code: 'HR', description: 'People operations', budget: 400000 },
    { id: 8, name: 'Finance', code: 'FIN', description: 'Finance and accounting', budget: 350000 },
    { id: 9, name: 'Operations', code: 'OPS', description: 'Day-to-day operations', budget: 300000 },
  ]);
};
