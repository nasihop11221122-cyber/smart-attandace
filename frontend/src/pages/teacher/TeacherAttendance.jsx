import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import AttendancePreviewModal from '../../components/teacher/AttendancePreviewModal';

const STATUSES = [
  { key: 'present', label: 'Present', active: 'border-green-600 bg-green-600 text-white' },
  { key: 'absent', label: 'Absent', active: 'border-red-600 bg-red-600 text-white' },
  { key: 'leave', label: 'Leave', active: 'border-amber-500 bg-amber-500 text-white' },
];

const todayLocal = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const formatTime = (ms) =>
  new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const readJSON = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or blocked, ignore
  }
};

const removeKey = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
};

const outlineButton =
  'rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60';

export default function TeacherAttendance() {
  const { user } = useAuth();
  const [date] = useState(todayLocal);
  const draftKey = `attendance-draft:${user.id}`;
  const cacheKey = `attendance-students:${user.id}`;

  const [students, setStudents] = useState([]);
  const [classLabel, setClassLabel] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [marks, setMarks] = useState({});
  const [pendingSend, setPendingSend] = useState(false);
  const [draftTime, setDraftTime] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  const restoreDraft = useCallback(
    (list, serverDraft) => {
      const ids = new Set(list.map((s) => s.id));

      const local = readJSON(draftKey);
      const localValid = Boolean(local) && local.date === date;
      if (local && !localValid) removeKey(draftKey);

      const serverTime = serverDraft ? Date.parse(serverDraft.updatedAt) : 0;

      // Is device par naye changes jo server tak nahi pahunche
      if (localValid && (!serverDraft || (local.savedAt || 0) > serverTime)) {
        const restored = {};
        Object.entries(local.marks || {}).forEach(([id, status]) => {
          if (ids.has(id) && (status === 'absent' || status === 'leave')) restored[id] = status;
        });
        setMarks(restored);
        setPendingSend(true);
        setDraftTime(serverDraft ? serverTime : null);
        setDirty(true);
        return;
      }

      // Server par save kiya hua draft
      if (serverDraft) {
        const restored = {};
        (serverDraft.absent || []).forEach((id) => {
          if (ids.has(id)) restored[id] = 'absent';
        });
        (serverDraft.leave || []).forEach((id) => {
          if (ids.has(id)) restored[id] = 'leave';
        });
        if (localValid) removeKey(draftKey);
        setMarks(restored);
        setPendingSend(false);
        setDraftTime(serverTime);
        setDirty(false);
        return;
      }

      setMarks({});
      setPendingSend(false);
      setDraftTime(null);
      setDirty(false);
    },
    [draftKey, date]
  );

  const load = useCallback(async () => {
    try {
      const res = await api.get('/teacher/attendance', { params: { date } });
      const list = res.data.students;
      setClassLabel(res.data.className);
      setStudents(list);
      setSubmitted(res.data.submitted);
      writeJSON(cacheKey, { className: res.data.className, students: list });

      if (res.data.submitted) {
        removeKey(draftKey);
        setMarks({});
        setPendingSend(false);
        setDraftTime(null);
        setDirty(false);
      } else {
        restoreDraft(list, res.data.draft);
      }
    } catch (err) {
      if (!err.response) {
        const cached = readJSON(cacheKey);
        if (cached) {
          setClassLabel(cached.className);
          setStudents(cached.students);
          setSubmitted(false);
          restoreDraft(cached.students, null);
        } else {
          toast.error('Could not connect to the server');
        }
      } else {
        toast.error(err.response.data?.message || 'Could not connect to the server');
      }
    } finally {
      setLoading(false);
    }
  }, [date, cacheKey, draftKey, restoreDraft]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      load();
    };
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [load]);

  const setStatus = (id, status) => {
    const next = { ...marks };
    if (status === 'present') delete next[id];
    else next[id] = status;
    setMarks(next);
    setDirty(true);
    writeJSON(draftKey, { date, marks: next, savedAt: Date.now() });
  };

  const splitMarks = () => ({
    absent: students.filter((s) => marks[s.id] === 'absent').map((s) => s.id),
    leave: students.filter((s) => marks[s.id] === 'leave').map((s) => s.id),
  });

  const saveDraft = async () => {
    setSavingDraft(true);
    const { absent, leave } = splitMarks();
    try {
      const res = await api.put('/teacher/attendance/draft', { date, absent, leave });
      removeKey(draftKey);
      setDraftTime(Date.parse(res.data.updatedAt));
      setDirty(false);
      setPendingSend(false);
      toast.success('Draft saved');
    } catch (err) {
      if (!err.response) {
        writeJSON(draftKey, { date, marks, savedAt: Date.now() });
        setPendingSend(true);
        toast.error(
          'No network. Draft is saved on this device only. Press Draft again when the network is back.'
        );
      } else {
        toast.error(err.response.data?.message || 'Could not connect to the server');
        if (err.response.status === 409) {
          removeKey(draftKey);
          await load();
        }
      }
    } finally {
      setSavingDraft(false);
    }
  };

  const submit = async () => {
    setConfirming(false);
    setBusy(true);
    const { absent, leave } = splitMarks();
    try {
      await api.post('/teacher/attendance', { date, absent, leave });
      removeKey(draftKey);
      toast.success('Attendance submitted successfully');
      await load();
    } catch (err) {
      if (!err.response) {
        writeJSON(draftKey, { date, marks, savedAt: Date.now() });
        setPendingSend(true);
        toast.error(
          'No network. Attendance is saved as a draft on this device. Press Submit when the network is back.'
        );
      } else {
        toast.error(err.response.data?.message || 'Could not connect to the server');
        if (err.response.status === 409) {
          removeKey(draftKey);
          await load();
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const locked = busy || savingDraft;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold text-slate-800">Attendance</h2>
          {classLabel && (
            <p className="truncate text-sm text-slate-500">
              {classLabel} · {date}
            </p>
          )}
        </div>

        {classLabel &&
          students.length > 0 &&
          (submitted ? (
            <span className="shrink-0 rounded-md bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
              Submitted
            </span>
          ) : (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button onClick={saveDraft} disabled={locked} className={outlineButton}>
                {savingDraft ? 'Saving…' : 'Draft'}
              </button>
              <button onClick={() => setPreviewing(true)} disabled={locked} className={outlineButton}>
                Preview
              </button>
              <button
                onClick={() => setConfirming(true)}
                disabled={locked}
                className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? 'Please wait…' : 'Submit'}
              </button>
            </div>
          ))}
      </div>

      {!online && (
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You are offline. You can keep marking attendance, it is saved as a draft on this device.
        </p>
      )}

      {!submitted && draftTime && !dirty && !pendingSend && (
        <p className="mt-4 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Draft saved at {formatTime(draftTime)}. Mark late students when they arrive, then press
          Submit.
        </p>
      )}

      {pendingSend && !submitted && (
        <p className="mt-4 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Unsent attendance is saved on this device. Press Draft or Submit to send it to the server.
        </p>
      )}

      {loading ? (
        <p className="mt-6 text-slate-500">Loading…</p>
      ) : !classLabel ? (
        <p className="mt-6 text-slate-500">
          No class is assigned to you yet. Please contact the principal.
        </p>
      ) : students.length === 0 ? (
        <p className="mt-6 text-slate-500">No students in your class yet. Add students first.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {students.map((s) => {
            const current = submitted ? s.status : marks[s.id] || 'present';
            return (
              <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-slate-800">{s.name}</h3>
                    <p className="truncate text-sm text-slate-500">{s.fatherName}</p>
                  </div>
                  <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                    Roll {s.rollNo}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-md bg-green-50 py-1.5">
                    <p className="text-base font-semibold text-green-700">{s.counts.present}</p>
                    <p className="text-slate-500">Present</p>
                  </div>
                  <div className="rounded-md bg-red-50 py-1.5">
                    <p className="text-base font-semibold text-red-700">{s.counts.absent}</p>
                    <p className="text-slate-500">Absent</p>
                  </div>
                  <div className="rounded-md bg-amber-50 py-1.5">
                    <p className="text-base font-semibold text-amber-700">{s.counts.leave}</p>
                    <p className="text-slate-500">Leave</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {STATUSES.map((st) => (
                    <button
                      key={st.key}
                      onClick={() => setStatus(s.id, st.key)}
                      disabled={submitted}
                      className={`rounded-md border px-2 py-2 text-sm font-medium transition disabled:cursor-not-allowed ${
                        current === st.key
                          ? st.active
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {previewing && (
        <AttendancePreviewModal
          classLabel={classLabel}
          date={date}
          students={students}
          marks={marks}
          busy={busy}
          onClose={() => setPreviewing(false)}
          onSubmit={() => {
            setPreviewing(false);
            submit();
          }}
        />
      )}

      {confirming && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white p-6">
            <h3 className="text-xl font-semibold text-slate-800">Submit Attendance</h3>
            <p className="text-sm text-slate-500">
              Submit the attendance for {classLabel}? It can be submitted only once per day and
              cannot be changed later.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}