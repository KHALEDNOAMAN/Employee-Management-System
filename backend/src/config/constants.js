module.exports = {
  SALT_ROUNDS: 12,
  TOKEN_EXPIRY: process.env.JWT_EXPIRY || '24h',
  EMPLOYMENT_TYPES: ['full_time', 'part_time', 'contract', 'intern'],
  EMPLOYMENT_STATUSES: ['active', 'on_leave', 'terminated', 'resigned'],
  LEAVE_TYPES: ['annual', 'sick', 'personal', 'maternity', 'paternity', 'unpaid'],
  LEAVE_STATUSES: ['pending', 'approved', 'rejected', 'cancelled'],
  ATTENDANCE_STATUSES: ['present', 'absent', 'half_day', 'late', 'remote'],
  GENDERS: ['male', 'female', 'other'],
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};
