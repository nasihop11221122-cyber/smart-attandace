import { useRef, useState } from 'react';

const cards = [
  { key: 'totalTeachers', label: 'All teachers', dot: 'bg-amber-500' },
  { key: 'totalStudents', label: 'All students', dot: 'bg-blue-600' },
  { key: 'present', label: 'Present today', dot: 'bg-emerald-600' },
  { key: 'absent', label: 'Absent today', dot: 'bg-orange-600' },
  { key: 'leave', label: 'Leave today', dot: 'bg-violet-600' },
];

const SERIES = [
  { key: 'present', label: 'Present', color: '#059669', tip: '#34d399' },
  { key: 'absent', label: 'Absent', color: '#ea580c', tip: '#fb923c' },
  { key: 'leave', label: 'Leave', color: '#7c3aed', tip: '#a78bfa' },
];

const WIDTH = 640;
const HEIGHT = 190;
const PAD = { top: 12, right: 18, bottom: 24, left: 40 };

const formatTime = (value) =>
  new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// Smooth curve jo points ke beech overshoot nahi karta (monotone cubic)
function smoothPath(pts) {
  const n = pts.length;
  if (n === 1) return `M ${pts[0].x},${pts[0].y}`;

  const dx = [];
  const m = [];
  for (let i = 0; i < n - 1; i += 1) {
    dx[i] = pts[i + 1].x - pts[i].x;
    m[i] = (pts[i + 1].y - pts[i].y) / dx[i];
  }

  const t = new Array(n);
  t[0] = m[0];
  t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i += 1) {
    if (m[i - 1] * m[i] <= 0) {
      t[i] = 0;
    } else {
      t[i] =
        (3 * (dx[i - 1] + dx[i])) /
        ((2 * dx[i] + dx[i - 1]) / m[i - 1] + (dx[i] + 2 * dx[i - 1]) / m[i]);
    }
  }

  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < n - 1; i += 1) {
    const h = dx[i] / 3;
    d += ` C ${pts[i].x + h},${pts[i].y + t[i] * h} ${pts[i + 1].x - h},${pts[i + 1].y - t[i + 1] * h} ${pts[i + 1].x},${pts[i + 1].y}`;
  }
  return d;
}

function AttendanceLine({ notifications, totalStudents }) {
  const svgRef = useRef(null);
  const [hover, setHover] = useState(null);

  if (!notifications || notifications.length === 0 || totalStudents <= 0) {
    return (
      <p className="mt-4 text-sm text-slate-500">
        No class has submitted attendance yet today.
      </p>
    );
  }

  const sorted = [...notifications].sort((a, b) => new Date(a.time) - new Date(b.time));

  const running = { present: 0, absent: 0, leave: 0 };
  const points = [{ label: 'Start', className: '', present: 0, absent: 0, leave: 0 }];
  sorted.forEach((n) => {
    running.present += n.present || 0;
    running.absent += n.absent || 0;
    running.leave += n.leave || 0;
    points.push({
      label: formatTime(n.time),
      className: n.className,
      present: running.present,
      absent: running.absent,
      leave: running.leave,
    });
  });

  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const baseY = PAD.top + innerH;

  const pct = (v) => (v / totalStudents) * 100;
  const maxPct = Math.max(
    ...points.map((p) => Math.max(pct(p.present), pct(p.absent), pct(p.leave))),
    1
  );
  const niceMax = Math.min(100, Math.max(20, Math.ceil(maxPct / 20) * 20));
  const ticks = [0, 1, 2, 3, 4].map((i) => (niceMax / 4) * i);
  const yOfPct = (p) => PAD.top + innerH - (p / niceMax) * innerH;

  const last = points.length - 1;
  const x = (i) => PAD.left + (last === 0 ? innerW / 2 : (i / last) * innerW);
  const y = (v) => yOfPct(pct(v));

  const pathOf = (key) => smoothPath(points.map((p, i) => ({ x: x(i), y: y(p[key]) })));
  const presentPath = pathOf('present');
  const presentArea = `${presentPath} L ${x(last)},${baseY} L ${x(0)},${baseY} Z`;

  const step = Math.max(1, Math.ceil(last / 4));
  const labelIndexes = points.map((_, i) => i).filter((i) => i % step === 0 || i === last);

  const onMove = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const ratio = (px - PAD.left) / innerW;
    const idx = Math.round(ratio * last);
    setHover(Math.min(last, Math.max(0, idx)));
  };

  const hp = hover === null ? null : points[hover];
  const TIP_W = 140;
  const TIP_H = 78;
  let tipX = 0;
  let tipY = 0;
  if (hp) {
    tipX = Math.min(Math.max(x(hover) - TIP_W / 2, PAD.left), WIDTH - PAD.right - TIP_W);
    const topY = y(Math.max(hp.present, hp.absent, hp.leave));
    const above = topY - TIP_H - 8 >= PAD.top;
    tipY = above ? topY - TIP_H - 8 : topY + 12;
  }

  return (
    <div className="mt-4 max-w-2xl">
      <div className="mb-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>

      <style>{'@keyframes att-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }'}</style>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label="Today's attendance progress as classes submit"
      >
        <defs>
          <linearGradient id="att-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={WIDTH - PAD.right} y1={yOfPct(t)} y2={yOfPct(t)} stroke="#eef2f6" strokeWidth="1" />
            <text x={PAD.left - 8} y={yOfPct(t) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
              {Math.round(t)}%
            </text>
          </g>
        ))}

        {labelIndexes.map((i) => (
          <text key={i} x={x(i)} y={HEIGHT - 6} textAnchor="middle" fontSize="10" fill="#94a3b8">
            {points[i].label}
          </text>
        ))}

        <path d={presentArea} fill="url(#att-fill)" />

        {SERIES.map((s) => (
          <path
            key={s.key}
            d={pathOf(s.key)}
            fill="none"
            stroke={s.color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="1"
            style={{ strokeDasharray: 1, strokeDashoffset: 0, animation: 'att-draw 1.2s ease-out' }}
          />
        ))}

        {SERIES.map((s) => (
          <circle key={s.key} cx={x(last)} cy={y(points[last][s.key])} r="3.5" fill="#ffffff" stroke={s.color} strokeWidth="1.5" />
        ))}

        {hp && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={baseY} stroke="#cbd5e1" strokeDasharray="3 3" />
            {SERIES.map((s) => (
              <circle key={s.key} cx={x(hover)} cy={y(hp[s.key])} r="3.5" fill={s.color} stroke="#ffffff" strokeWidth="1.5" />
            ))}
            <rect x={tipX} y={tipY} width={TIP_W} height={TIP_H} rx="8" fill="#0f172a" />
            <text x={tipX + 10} y={tipY + 16} fontSize="10" fill="#cbd5e1">
              {hp.className ? `${hp.className} · ${hp.label}` : 'Start of day'}
            </text>
            {SERIES.map((s, i) => (
              <text key={s.key} x={tipX + 10} y={tipY + 33 + i * 15} fontSize="11" fontWeight="600" fill={s.tip}>
                {s.label}: {hp[s.key]}
              </text>
            ))}
          </g>
        )}

        <rect
          x={PAD.left}
          y={PAD.top}
          width={innerW}
          height={innerH}
          fill="transparent"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        />
      </svg>
    </div>
  );
}

export default function AttendanceOverview({ stats, notifications }) {
  const { totalStudents, present } = stats;
  const percent = totalStudents > 0 ? Math.round((present / totalStudents) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((c) => (
          <div key={c.key} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <span className={`h-2 w-2 rounded-sm ${c.dot}`} />
              {c.label}
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-800">
              {stats[c.key].toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Today's attendance</p>
            <p className="mt-1 text-sm text-slate-600">
              {present.toLocaleString()} present out of {totalStudents.toLocaleString()} students
            </p>
          </div>
          <p className="text-4xl font-semibold tabular-nums text-slate-800">{percent}%</p>
        </div>

        <AttendanceLine notifications={notifications} totalStudents={totalStudents} />
      </div>
    </div>
  );
}