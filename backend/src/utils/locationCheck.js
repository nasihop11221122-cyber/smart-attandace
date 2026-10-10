const EARTH_RADIUS_M = 6371000;

// Every class circle has this radius (in meters). It is fixed here, the admin cannot change it.
export const CLASS_RADIUS_M = 200;

export const LIMITS = {
  maxAccuracyM: 100, // worse than this: the reading is not trusted
  maxAgeMs: 2 * 60 * 1000, // reading must be taken within the last 2 minutes
  maxFutureMs: 60 * 1000, // small clock difference allowed
  duplicateLimit: 2, // same exact point already used by this many other students
};

const toRad = (deg) => (deg * Math.PI) / 180;

export const distanceMeters = (a, b) => {
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
};

const decimals = (n) => {
  const s = String(n);
  const i = s.indexOf('.');
  return i === -1 ? 0 : s.length - i - 1;
};

export const hasClassLocation = (loc) =>
  Boolean(loc) && Number.isFinite(loc.latitude) && Number.isFinite(loc.longitude);

/**
 * Decides on the server whether a location reading is inside the class circle.
 * Returns { verdict: 'inside' | 'outside' | 'uncertain', distance, flags }.
 * Anything that cannot be trusted is 'uncertain' so an admin can review it.
 */
export const evaluateLocation = ({ classLocation, reading, now = Date.now(), sameCoordinateCount = 0 }) => {
  if (!reading) return { verdict: 'uncertain', distance: null, flags: ['no_location'] };
  if (!hasClassLocation(classLocation)) {
    return { verdict: 'uncertain', distance: null, flags: ['class_location_not_set'] };
  }

  const flags = [];

  // Layer: fresh location
  const age = now - reading.capturedAt;
  if (!Number.isFinite(age) || age > LIMITS.maxAgeMs || age < -LIMITS.maxFutureMs) {
    flags.push('stale_location');
  }

  // Layer: accuracy
  if (!(reading.accuracy > 0)) flags.push('zero_accuracy');
  else if (reading.accuracy > LIMITS.maxAccuracyM) flags.push('low_accuracy');

  // Layer: suspicious patterns (real GPS is never this clean)
  if (decimals(reading.latitude) <= 4 && decimals(reading.longitude) <= 4) {
    flags.push('rounded_coordinates');
  }
  if (sameCoordinateCount >= LIMITS.duplicateLimit) flags.push('duplicate_coordinates');

  // Layer: the circle decision
  const distance = distanceMeters(classLocation, reading);
  const radius = CLASS_RADIUS_M;
  const accuracy = reading.accuracy > 0 ? reading.accuracy : 0;

  let verdict;
  if (flags.length > 0) verdict = 'uncertain';
  else if (distance <= radius) verdict = 'inside';
  else if (distance - accuracy > radius) verdict = 'outside';
  else {
    verdict = 'uncertain';
    flags.push('near_boundary');
  }

  return { verdict, distance: Math.round(distance), flags };
};