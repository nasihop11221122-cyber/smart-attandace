import { useState } from 'react';
import { toast } from 'react-toastify';
import { getCurrentLocation } from '../../utils/getLocation';

// Default radius if not set
const DEFAULT_RADIUS_M = 200;

// Only the fields the server needs (accuracy is for display only)
export const locationPayload = (loc) => ({
  latitude: loc.latitude,
  longitude: loc.longitude,
  ...(loc.radius ? { radius: Number(loc.radius) } : {}),
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
        radius: value?.radius || DEFAULT_RADIUS_M,
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const onRadiusChange = (e) => {
    const val = Math.max(20, Math.min(2000, Number(e.target.value) || DEFAULT_RADIUS_M));
    onChange({
      ...value,
      radius: val,
    });
  };

  const currentRadius = value?.radius ?? DEFAULT_RADIUS_M;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-600">Class location (optional)</span>
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

          <div className="mt-1 flex items-center justify-between gap-3 border-t border-slate-200 pt-2">
            <label className="flex flex-col gap-0.5 text-xs font-medium text-slate-700">
              Geofence Radius (meters)
              <span className="text-[11px] font-normal text-slate-500">
                Students must be within this distance to mark attendance
              </span>
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={20}
                max={2000}
                step={10}
                value={currentRadius}
                onChange={onRadiusChange}
                className="w-20 rounded border border-slate-300 bg-white px-2 py-1 text-right text-xs font-semibold text-slate-800 outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
              />
              <span className="text-xs font-semibold text-slate-500">m</span>
            </div>
          </div>
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