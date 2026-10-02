export const SCHOOL_TIME_ZONE = 'Asia/Karachi';

const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: SCHOOL_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

// Returns today's date as YYYY-MM-DD in the school time zone
export const dateInSchoolZone = (date = new Date()) => {
  const parts = formatter.formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
};