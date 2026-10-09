// Days of the week in the order shown to the admin (value 0 = Sunday ... 6 = Saturday)
export const DAY_OPTIONS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
];

// [1, 3, 5] -> "Mon, Wed, Fri"
export const formatDays = (days) => {
  if (!days || days.length === 0) return '';
  if (days.length === 7) return 'Every day';
  return DAY_OPTIONS.filter((d) => days.includes(d.value))
    .map((d) => d.label)
    .join(', ');
};

// "2026-10-07" -> "7 Oct 2026"
export const formatCourseDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });