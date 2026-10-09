import { coursePeriod, runsOnDate } from './courseTime.js';

// "2026-10-07" -> "2026-10-08"
const nextDay = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
};

const newestFirst = (list) => [...list].sort().reverse();

// Present, pending and absent dates of one student for one course.
// - present: accepted requests
// - pending: requests the admin has not decided yet
// - absent: a day the course was held (inside its 6 months, on its days, not a holiday, after
//   the student joined, and already finished) where the student has no accepted or pending request
export const buildCourseReport = ({ course, records, joinedDate, today, nowMin, holidays }) => {
  const present = [];
  const pending = [];
  const marked = new Set();

  records.forEach((r) => {
    if (r.status === 'accepted') {
      present.push(r.date);
      marked.add(r.date);
    } else if (r.status === 'pending') {
      pending.push(r.date);
      marked.add(r.date);
    }
  });

  const { startDate, endDate } = coursePeriod(course);
  const from = startDate > joinedDate ? startDate : joinedDate;
  const to = endDate < today ? endDate : today;

  const absent = [];
  for (let d = from; d <= to; d = nextDay(d)) {
    if (!runsOnDate(course, d)) continue;
    if (holidays.has(d)) continue;
    if (d === today && nowMin < course.endMin) continue; // today's course is not finished yet
    if (marked.has(d)) continue;
    absent.push(d);
  }

  return {
    present: newestFirst(present),
    pending: newestFirst(pending),
    absent: newestFirst(absent),
  };
};