const TURKISH_HOLIDAYS_2026 = [
  '2026-01-01', '2026-04-23', '2026-05-01', '2026-05-19',
  '2026-06-25', '2026-06-26', '2026-06-27', '2026-06-28',
  '2026-07-15', '2026-08-30', '2026-10-29',
  '2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04',
];

function calculateWorkingDays(startDate, endDate, holidays = TURKISH_HOLIDAYS_2026) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const day = current.getDay();
    const dateStr = current.toISOString().split('T')[0];
    if (day !== 0 && day !== 6 && !holidays.includes(dateStr)) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

module.exports = { calculateWorkingDays, TURKISH_HOLIDAYS_2026 };
