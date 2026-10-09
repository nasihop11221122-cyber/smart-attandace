const KEY = 'attendance_device_id';
let memoryId = '';

const makeId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
};

// A random id saved in this browser. It is the "phone" the server remembers.
export const getDeviceId = () => {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return saved;
    const id = makeId();
    localStorage.setItem(KEY, id);
    return id;
  } catch {
    if (!memoryId) memoryId = makeId();
    return memoryId;
  }
};