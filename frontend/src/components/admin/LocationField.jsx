import { useState } from 'react';
import { toast } from 'react-toastify';
import { getCurrentLocation } from '../../utils/getLocation';

const inputClass =
  'rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20';

// Only the fields the server needs (accuracy is for display only)
export const locationPayload = (loc) => ({
  latitude: loc.latitude,
  longitude: loc.longitude,
  radius: Number(loc.radius),
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
        radius: value?.radius ?? 100,
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const onRadius = (e) => onChange({ ...value, radius: e.target.value });

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
          <label className="flex flex-col gap-1.5 text-sm text-slate-500">
            Radius in meters (50 to 1000)
            <input
              type="number"
              min={50}
              max={1000}
              step={10}
              value={value.radius}
              onChange={onRadius}
              className={inputClass}
            />
          </label>
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