import { dateInSchoolZone } from './schoolDate.js';

const COURSE_MONTHS = 6;

// "07:30" -> 450
export const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

// 450 -> "07:30"
export const toHHMM = (mins) =>
  `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

// "2026-10-07" + 6 months -> "2027-04-07" (a short month keeps its last day: 31 Aug -> 28 Feb)
export const addMonthsToDate = (dateStr, months) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = m - 1 + months;
  const year = y + Math.floor(target / 12);
  const month = ((target % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const day = Math.min(d, lastDay);
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

// "2026-10-07" -> day of the week (0 = Sunday ... 6 = Saturday)
export const weekdayOf = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
};

// The 6 month period of a course. Older courses without dates use the day they were created.
export const coursePeriod = (c) => {
  const startDate = c.startDate || dateInSchoolZone(c.createdAt);
  return { startDate, endDate: c.endDate || addMonthsToDate(startDate, COURSE_MONTHS) };
};

// Is the course part of this day? (inside its 6 months and on one of its days)
// An older course without saved days runs on every day.
export const runsOnDate = (c, date) => {
  const { startDate, endDate } = coursePeriod(c);
  if (date < startDate || date > endDate) return false;
  return !c.days || c.days.length === 0 || c.days.includes(weekdayOf(date));
};

// The course that is running at this minute of this day (start included, end excluded)
export const findRunningCourse = (courses, nowMin, date) =>
  courses.find((c) => runsOnDate(c, date) && c.startMin <= nowMin && nowMin < c.endMin) || null;