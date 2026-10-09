export const SCHOOL_TIME_ZONE = 'Asia/Karachi';

const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: SCHOOL_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: SCHOOL_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

// Returns today's date as YYYY-MM-DD in the school time zone
export const dateInSchoolZone = (date = new Date()) => {
  const parts = formatter.formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
};

// Returns the minutes passed since midnight (0 to 1439) in the school time zone
export const minutesInSchoolZone = (date = new Date()) => {
  const parts = timeFormatter.formatToParts(date);
  const get = (type) => Number(parts.find((p) => p.type === type).value);
  return get('hour') * 60 + get('minute');
};