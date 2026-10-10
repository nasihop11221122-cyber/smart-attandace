import { useState } from 'react';
import { toast } from 'react-toastify';
import { getCurrentLocation } from '../../utils/getLocation';

// Same value as CLASS_RADIUS_M on the server. The server decides, this is only for the text.
const CLASS_RADIUS_M = 200;

// Only the fields the server needs (accuracy is for display only)
export const locationPayload = (loc) => ({
  latitude: loc.latitude,
  longitude: loc.longitude,
});

export default function LocationField({ value, onChange }) {
  const [busy, setBusy] = useState(false);

  const capture = async () => {
    setBusy(true);
    try {
      const reading = await getCurrentLocation();
      onChange({
        latitude: reading.latitude,
        longitude: reading.longitude,
        accuracy: reading.accuracy,
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-slate-500">Class location (optional)</span>
        <button
          type="button"
          onClick={capture}
          disabled={busy}
          className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? 'Getting location…' : 'Use my current location'}
        </button>
      </div>

      {value ? (
        <>
          <p className="text-xs text-slate-600">
            Saved point: {Number(value.latitude).toFixed(6)}, {Number(value.longitude).toFixed(6)}
            {typeof value.accuracy === 'number' && ` (accuracy ±${Math.round(value.accuracy)} m)`}
          </p>
          {typeof value.accuracy === 'number' && value.accuracy > 50 && (
            <p className="text-xs text-amber-700">
              The accuracy is low. Move near a window or outside and press the button again.
            </p>
          )}
          <p className="text-xs text-slate-500">
            Students must be within {CLASS_RADIUS_M} meters of this point.
          </p>
        </>
      ) : (
        <p className="text-xs text-slate-500">
          Stand inside the campus and press the button. Without a location, attendance requests of
          this class cannot be checked.
        </p>
      )}
    </div>
  );
}