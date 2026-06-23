const { calculateWorkingDays } = require('../src/utils/workingDays');

describe('calculateWorkingDays', () => {
  test('Monday to Friday = 5 working days', () => {
    expect(calculateWorkingDays('2026-06-01', '2026-06-05', [])).toBe(5);
  });
  test('Full week including weekend = 5 working days', () => {
    expect(calculateWorkingDays('2026-06-01', '2026-06-07', [])).toBe(5);
  });
  test('Weekend only = 0 working days', () => {
    expect(calculateWorkingDays('2026-06-06', '2026-06-07', [])).toBe(0);
  });
  test('Single weekday = 1 working day', () => {
    expect(calculateWorkingDays('2026-06-01', '2026-06-01', [])).toBe(1);
  });
  test('Excludes holidays', () => {
    expect(calculateWorkingDays('2026-06-01', '2026-06-05', ['2026-06-03'])).toBe(4);
  });
});
