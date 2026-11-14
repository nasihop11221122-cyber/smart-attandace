import mongoose from 'mongoose';
import SchoolHoliday from '../models/SchoolHoliday.js';
import { dateInSchoolZone } from '../utils/schoolDate.js';
import { getWeeklyOffDays, setWeeklyOffDays } from '../utils/holidayCheck.js';

const publicHoliday = (h) => ({
  id: String(h._id),
  date: h.date,
  title: h.title || '',
  isAnnual: Boolean(h.isAnnual),
  annualMonthDay: h.annualMonthDay || null,
});

export const getSchoolHolidays = async (req, res) => {
  const [holidays, weeklyOffs] = await Promise.all([
    SchoolHoliday.find().sort({ date: -1 }).lean(),
    getWeeklyOffDays('school'),
  ]);

  res.json({
    today: dateInSchoolZone(),
    holidays: holidays.map(publicHoliday),
    weeklyOffs,
  });
};

export const createSchoolHoliday = async (req, res) => {
  const { date, startDate, endDate, title, isAnnual } = req.body;

  // Range creation (e.g. Winter Vacation / Eid Holidays)
  if (startDate && endDate) {
    if (startDate > endDate) {
      return res.status(400).json({ message: 'Start date cannot be after end date' });
    }

    const cur = new Date(`${startDate}T00:00:00Z`);
    const end = new Date(`${endDate}T00:00:00Z`);
    const dateList = [];

    // Safety limit of 60 days in a single range
    while (cur <= end && dateList.length <= 60) {
      dateList.push(cur.toISOString().slice(0, 10));
      cur.setUTCDate(cur.getUTCDate() + 1);
    }

    const existing = await SchoolHoliday.find({ date: { $in: dateList } }).select('date').lean();
    const existingSet = new Set(existing.map((h) => h.date));
    const toInsert = dateList
      .filter((d) => !existingSet.has(d))
      .map((d) => ({
        date: d,
        title: title || 'Scheduled School Break',
        isAnnual: false,
      }));

    if (toInsert.length > 0) {
      await SchoolHoliday.insertMany(toInsert, { ordered: false });
    }

    return res.status(201).json({
      message: `Successfully added ${toInsert.length} holiday dates`,
      count: toInsert.length,
    });
  }

  // Single date creation
  try {
    const annualMonthDay = isAnnual ? date.slice(5) : null;
    const created = await SchoolHoliday.create({
      date,
      title,
      isAnnual: Boolean(isAnnual),
      annualMonthDay,
    });
    res.status(201).json({ holiday: publicHoliday(created) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'This date is already marked as a holiday' });
    }
    throw err;
  }
};

export const updateSchoolWeeklyOffs = async (req, res) => {
  const { days } = req.body;
  const updatedDays = await setWeeklyOffDays('school', days, req.user._id);
  res.json({
    success: true,
    message: 'Weekly off days updated successfully',
    weeklyOffs: updatedDays,
  });
};

export const deleteSchoolHoliday = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: 'Holiday not found' });

  const holiday = await SchoolHoliday.findByIdAndDelete(id);
  if (!holiday) return res.status(404).json({ message: 'Holiday not found' });

  res.json({ message: 'Holiday deleted successfully' });
};
