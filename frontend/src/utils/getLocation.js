const messageFor = (err) => {
  if (err.code === 1) return 'Location permission was denied. Allow location access and try again';
  if (err.code === 2) return 'Your location could not be found. Turn on GPS and try again';
  if (err.code === 3) return 'Getting your location took too long. Please try again';
  return 'Could not get your location';
};

// Returns a fresh GPS reading: { latitude, longitude, accuracy, capturedAt }
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      reject(new Error('Location is not supported on this device'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          capturedAt: pos.timestamp,
        }),
      (err) => reject(new Error(messageFor(err))),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
}