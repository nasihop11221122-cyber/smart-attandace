const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/;
const STATUSES = ['accepted', 'rejected', 'pending'];

// A real calendar day in the form YYYY-MM-DD
const isRealDate = (value) => {
  if (!DATE_RE.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
};

// Checks the filters of the history page. Anything that is not a plain text is refused
// (this also stops query objects like ?status[$ne]=x).
export const parseHistoryQuery = (query) => {
  const text = (v) => (typeof v === 'string' ? v.trim() : v === undefined ? '' : null);
  const from = text(query.from);
  const to = text(query.to);
  const classId = text(query.classId);
  const courseId = text(query.courseId);
  const status = text(query.status);
  const q = text(query.q);
  const pageText = text(query.page);

  if ([from, to, classId, courseId, status, q, pageText].includes(null)) {
    return { error: 'The filters are not valid' };
  }
  if (from && !isRealDate(from)) return { error: 'Please select a valid date' };
  if (to && !isRealDate(to)) return { error: 'Please select a valid date' };
  if (from && to && from > to) return { error: 'The start date must not be after the end date' };
  if (classId && !OBJECT_ID_RE.test(classId)) return { error: 'Please select a valid class' };
  if (courseId && !OBJECT_ID_RE.test(courseId)) return { error: 'Please select a valid course' };
  if (status && !STATUSES.includes(status)) return { error: 'Please select a valid status' };
  if (q.length > 60) return { error: 'The search text is too long' };

  const page = Math.min(Math.max(parseInt(pageText, 10) || 1, 1), 100000);
  return { value: { from, to, classId, courseId, status, q, page } };
};