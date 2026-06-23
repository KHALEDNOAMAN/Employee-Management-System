exports.seed = async function(knex) {
  await knex('positions').del();
  await knex('positions').insert([
    { id: 1, title: 'Chief Executive Officer', min_salary: 80000, max_salary: 150000, pay_grade: 'E1' },
    { id: 2, title: 'Chief Technology Officer', min_salary: 70000, max_salary: 120000, pay_grade: 'E2' },
    { id: 3, title: 'HR Manager', min_salary: 35000, max_salary: 55000, pay_grade: 'M1' },
    { id: 4, title: 'Senior Software Developer', min_salary: 40000, max_salary: 65000, pay_grade: 'S1' },
    { id: 5, title: 'Junior Software Developer', min_salary: 20000, max_salary: 35000, pay_grade: 'J1' },
    { id: 6, title: 'Content Writer', min_salary: 18000, max_salary: 30000, pay_grade: 'J2' },
    { id: 7, title: 'Marketing Specialist', min_salary: 22000, max_salary: 38000, pay_grade: 'S2' },
    { id: 8, title: 'DevOps Engineer', min_salary: 35000, max_salary: 60000, pay_grade: 'S1' },
    { id: 9, title: 'UX Designer', min_salary: 28000, max_salary: 48000, pay_grade: 'S2' },
    { id: 10, title: 'Data Analyst', min_salary: 25000, max_salary: 42000, pay_grade: 'S2' },
    { id: 11, title: 'Finance Specialist', min_salary: 28000, max_salary: 45000, pay_grade: 'S2' },
    { id: 12, title: 'Product Manager', min_salary: 40000, max_salary: 65000, pay_grade: 'M2' },
  ]);
};
