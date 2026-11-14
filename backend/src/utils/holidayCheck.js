import Holiday from '../models/Holiday.js';
import SchoolHoliday from '../models/SchoolHoliday.js';
import WeeklyOff from '../models/WeeklyOff.js';

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Get weekly off days array (0-6) for a given scope ('college' | 'school')
 */
export async function getWeeklyOffDays(scope) {
  let doc = await WeeklyOff.findOne({ scope }).lean();
  if (!doc) {
    // Default Sunday off
    try {
      doc = await WeeklyOff.create({ scope, days: [0] });
    } catch {
      doc = await WeeklyOff.findOne({ scope }).lean();
    }
  }
  return doc?.days || [0];
}

/**
 * Update weekly off days for a given scope
 */
export async function setWeeklyOffDays(scope, days, userId) {
  const cleanDays = [...new Set(days.map(Number))].filter((d) => d >= 0 && d <= 6).sort((a, b) => a - b);
  const updated = await WeeklyOff.findOneAndUpdate(
    { scope },
    { $set: { days: cleanDays, updatedBy: userId } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return updated.days;
}

/**
 * Returns UTC day index (0 = Sun, 1 = Mon, ..., 6 = Sat) for 'YYYY-MM-DD'
 */
export function getDayOfWeek(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/**
 * Check if a date is a holiday for College / Online
 */
export async function isCollegeHoliday(dateStr) {
  const dayOfWeek = getDayOfWeek(dateStr);
  const weeklyOffs = await getWeeklyOffDays('college');

  if (weeklyOffs.includes(dayOfWeek)) {
    return {
      isHoliday: true,
      reason: `Weekly Off (${DAY_NAMES[dayOfWeek]})`,
      isWeeklyOff: true,
      dayOfWeek,
      title: `Weekly Off (${DAY_NAMES[dayOfWeek]})`,
    };
  }

  // Exact date holiday
  const exact = await Holiday.findOne({ date: dateStr }).lean();
  if (exact) {
    return {
      isHoliday: true,
      reason: exact.title || 'Official Holiday',
      holiday: exact,
      title: exact.title || 'Official Holiday',
      isWeeklyOff: false,
    };
  }

  // Annual recurring holiday (MM-DD match)
  const monthDay = dateStr.slice(5);
  const annual = await Holiday.findOne({ isAnnual: true, annualMonthDay: monthDay }).lean();
  if (annual) {
    return {
      isHoliday: true,
      reason: annual.title || 'Annual Holiday',
      holiday: annual,
      title: annual.title || 'Annual Holiday',
      isAnnual: true,
      isWeeklyOff: false,
    };
  }

  return { isHoliday: false };
}

/**
 * Check if a date is a holiday for School / Physical
 */
export async function isSchoolHoliday(dateStr) {
  const dayOfWeek = getDayOfWeek(dateStr);
  const weeklyOffs = await getWeeklyOffDays('school');

  if (weeklyOffs.includes(dayOfWeek)) {
    return {
      isHoliday: true,
      reason: `Weekly Off (${DAY_NAMES[dayOfWeek]})`,
      isWeeklyOff: true,
      dayOfWeek,
      title: `Weekly Off (${DAY_NAMES[dayOfWeek]})`,
    };
  }

  // Exact date holiday
  const exact = await SchoolHoliday.findOne({ date: dateStr }).lean();
  if (exact) {
    return {
      isHoliday: true,
      reason: exact.title || 'Official School Holiday',
      holiday: exact,
      title: exact.title || 'Official School Holiday',
      isWeeklyOff: false,
    };
  }

  // Annual recurring holiday (MM-DD match)
  const monthDay = dateStr.slice(5);
  const annual = await SchoolHoliday.findOne({ isAnnual: true, annualMonthDay: monthDay }).lean();
  if (annual) {
    return {
      isHoliday: true,
      reason: annual.title || 'Annual School Holiday',
      holiday: annual,
      title: annual.title || 'Annual School Holiday',
      isAnnual: true,
      isWeeklyOff: false,
    };
  }

  return { isHoliday: false };
}

/**
 * Returns a Set of date strings that are holidays between startDate and endDate
 */
export async function getCollegeHolidaySet(startDate, endDate) {
  const holidaySet = new Set();
  const weeklyOffs = await getWeeklyOffDays('college');

  // Exact dates
  const exactList = await Holiday.find({
    date: { $gte: startDate, $lte: endDate },
  }).select('date').lean();
  exactList.forEach((h) => holidaySet.add(h.date));

  // Annual holidays
  const annualList = await Holiday.find({ isAnnual: true }).select('annualMonthDay').lean();
  const annualSet = new Set(annualList.map((a) => a.annualMonthDay));

  // Iterate dates
  let cur = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);

  while (cur <= end) {
    const iso = cur.toISOString().slice(0, 10);
    const day = cur.getUTCDay();
    const mmdd = iso.slice(5);

    if (weeklyOffs.includes(day) || annualSet.has(mmdd)) {
      holidaySet.add(iso);
    }
    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  return holidaySet;
}
