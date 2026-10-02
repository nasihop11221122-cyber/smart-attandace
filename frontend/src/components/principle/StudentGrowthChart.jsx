import { useRef, useState } from 'react';

const WIDTH = 640;
const HEIGHT = 260;
const PAD = { top: 16, right: 16, bottom: 28, left: 40 };

const PRESENT = '#059669';
const ABSENT = '#ea580c';

const formatDay = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export default function StudentGrowthChart({ data }) {
  const svgRef = useRef(null);
  const [hover, setHover] = useState(null);

  if (!data || data.length === 0) return null;

  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const maxVal = Math.max(...data.map((d) => Math.max(d.present, d.absent)), 1);
  const niceMax = Math.max(4, Math.ceil(maxVal / 4) * 4);

  const x = (i) => PAD.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v) => PAD.top + innerH - (v / niceMax) * innerH;
  const baseY = PAD.top + innerH;

  const buildLine = (key) => `M ${data.map((d, i) => `${x(i)},${y(d[key])}`).join(' L ')}`;
  const presentLine = buildLine('present');
  const absentLine = buildLine('absent');
  const areaOf = (line) => `${line} L ${x(data.length - 1)},${baseY} L ${x(0)},${baseY} Z`;

  const ticks = [0, 1, 2, 3, 4].map((i) => (niceMax / 4) * i);

  const step = Math.max(1, Math.ceil((data.length - 1) / 4));
  const labelIndexes = data
    .map((_, i) => i)
    .filter((i) => i % step === 0 || i === data.length - 1);

  const last = data.length - 1;

  const onMove = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const ratio = (px - PAD.left) / innerW;
    const idx = Math.round(ratio * (data.length - 1));
    setHover(Math.min(data.length - 1, Math.max(0, idx)));
  };

  const hovered = hover === null ? null : data[hover];
  const TIP_W = 120;
  const TIP_H = 56;
  let tipX = 0;
  let tipY = 0;
  if (hovered) {
    tipX = Math.min(Math.max(x(hover) - TIP_W / 2, PAD.left), WIDTH - PAD.right - TIP_W);
    const topY = y(Math.max(hovered.present, hovered.absent));
    const above = topY - TIP_H - 10 >= PAD.top;
    tipY = above ? topY - TIP_H - 10 : topY + 14;
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-600">
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-4 rounded" style={{ background: PRESENT }} />
          Present
        </span>
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-4 rounded" style={{ background: ABSENT }} />
          Absent
        </span>
      </div>

      <style>{'@keyframes att-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }'}</style>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label="Students present and absent over time"
      >
        <defs>
          <linearGradient id="att-fill-present" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PRESENT} stopOpacity="0.2" />
            <stop offset="100%" stopColor={PRESENT} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="att-fill-absent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ABSENT} stopOpacity="0.18" />
            <stop offset="100%" stopColor={ABSENT} stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeWidth="1" />
            <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#64748b">
              {t}
            </text>
          </g>
        ))}

        {labelIndexes.map((i) => (
          <text key={i} x={x(i)} y={HEIGHT - 8} textAnchor="middle" fontSize="11" fill="#64748b">
            {formatDay(data[i].date)}
          </text>
        ))}

        <path d={areaOf(presentLine)} fill="url(#att-fill-present)" />
        <path d={areaOf(absentLine)} fill="url(#att-fill-absent)" />

        <path
          d={presentLine}
          fill="none"
          stroke={PRESENT}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
          style={{ strokeDasharray: 1, strokeDashoffset: 0, animation: 'att-draw 1.2s ease-out' }}
        />
        <path
          d={absentLine}
          fill="none"
          stroke={ABSENT}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
          style={{ strokeDasharray: 1, strokeDashoffset: 0, animation: 'att-draw 1.2s ease-out' }}
        />

        <circle cx={x(last)} cy={y(data[last].present)} r="5" fill="#ffffff" stroke={PRESENT} strokeWidth="2.5" />
        <circle cx={x(last)} cy={y(data[last].absent)} r="5" fill="#ffffff" stroke={ABSENT} strokeWidth="2.5" />

        {hovered && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={baseY} stroke="#94a3b8" strokeDasharray="4 4" />
            <circle cx={x(hover)} cy={y(hovered.present)} r="4.5" fill={PRESENT} stroke="#ffffff" strokeWidth="2" />
            <circle cx={x(hover)} cy={y(hovered.absent)} r="4.5" fill={ABSENT} stroke="#ffffff" strokeWidth="2" />
            <rect x={tipX} y={tipY} width={TIP_W} height={TIP_H} rx="8" fill="#0f172a" />
            <text x={tipX + TIP_W / 2} y={tipY + 15} textAnchor="middle" fontSize="11" fill="#cbd5e1">
              {formatDay(hovered.date)}
            </text>
            <text x={tipX + 12} y={tipY + 31} fontSize="12" fontWeight="600" fill="#34d399">
              Present: {hovered.present}
            </text>
            <text x={tipX + 12} y={tipY + 47} fontSize="12" fontWeight="600" fill="#fb923c">
              Absent: {hovered.absent}
            </text>
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