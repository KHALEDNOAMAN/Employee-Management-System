const { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = require('../config/constants');
const formatResponse = (data, meta) => { const r = { success: true, data }; if (meta) r.meta = meta; return r; };
const getPaginationParams = (query) => {
  let page = parseInt(query.page) || 1;
  let perPage = Math.min(parseInt(query.perPage || query.limit) || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  return { page, perPage, offset: (page - 1) * perPage };
};
const formatPaginationMeta = (page, perPage, total) => ({ page, perPage, total, totalPages: Math.ceil(total / perPage) });
const generateEmployeeNumber = (year, seq) => `EMP-${year}-${String(seq).padStart(3, '0')}`;
module.exports = { formatResponse, getPaginationParams, formatPaginationMeta, generateEmployeeNumber };
