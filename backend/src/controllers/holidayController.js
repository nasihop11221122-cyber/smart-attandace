import mongoose from 'mongoose';
import Holiday from '../models/Holiday.js';
import { dateInSchoolZone } from '../utils/schoolDate.js';

const publicHoliday = (h) => ({
  id: String(h._id),
  date: h.date,
  title: h.title || '',
});

export const getHolidays = async (req, res) => {
  const holidays = await Holiday.find().sort({ date: -1 });
  res.json({ today: dateInSchoolZone(), holidays: holidays.map(publicHoliday) });
};

export const createHoliday = async (req, res) => {
  const { date, title } = req.body;

  try {
    const created = await Holiday.create({ date, title });
    res.status(201).json({ holiday: publicHoliday(created) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'This date is already marked as a holiday' });
    }
    throw err;
  }
};

export const deleteHoliday = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: 'Holiday not found' });

  const holiday = await Holiday.findByIdAndDelete(id);
  if (!holiday) return res.status(404).json({ message: 'Holiday not found' });

  res.json({ message: 'Holiday deleted successfully' });
};