// Dense 2x2 analytics grid. Originally the golfer Analytics tab; now reused as
// the per-student analytics view in Coach View. Restyled to the shared design
// system (#1A2A1A cards, border-white/10, uppercase micro-labels).
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import type { SessionAnalytics } from "@/lib/analyticsService";

const MADE = "#22C55E";
const MISS = "#EF4444";
const BLUE = "#3B82F6";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#1A2A1A] border border-white/10 rounded-[12px] p-6 flex flex-col ${className}`}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">{children}</div>
  );
}

export function AnalyticsGrid({ data }: { data: SessionAnalytics }) {
  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-6 min-h-[640px]">
      <SessionSummary data={data} />
      <StartLineAnalysis data={data} />
      <SpeedControl data={data} />
      <PuttMap data={data} />
    </div>
  );
}

/* ---------------- Session Summary ---------------- */

function SessionSummary({ data }: { data: SessionAnalytics }) {
  const { makePercent, totalPutts, made, missed } = data;
  const size = 140;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (makePercent / 100) * c;

  return (
    <Card>
      <Label>Session Summary</Label>
      <div className="flex items-center gap-6 mt-4">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={MADE}
              strokeWidth={stroke}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={c}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-white">{makePercent}%</div>
            <Label>Make %</Label>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 flex-1">
          <Stat label="Total Putts" value={totalPutts} />
          <Stat label="Made" value={made} valueClass="text-[#22C55E]" />
          <Stat label="Miss" value={missed} valueClass="text-[#EF4444]" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mt-6">
        <Stat label="Avg Distance" value={`${data.avgDistanceFt} ft`} small />
        <Stat label="Avg Speed" value={`${data.avgSpeedMs} m/s`} small />
        <Stat
          label="Avg Start Line"
          value={`${Math.abs(data.avgStartLineDeg)}° ${data.avgStartLineDeg < 0 ? "Left" : "Right"}`}
          small
        />
        <Stat
          label="Avg Break"
          value={`${Math.abs(data.avgBreakDeg)}° ${data.avgBreakDeg < 0 ? "Left" : "Right"}`}
          small
        />
      </div>

      <div className="mt-6 flex-1 flex flex-col justify-end">
        <div className="flex items-center justify-between mb-2">
          <Label>Start Line Accuracy</Label>
          <div className="text-xs text-[#22C55E] font-semibold">
            {data.withinOneFiveDegPercent}% Within 1.5°
          </div>
        </div>
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.startLineAccuracy}>
              <XAxis dataKey="bucket" tick={{ fill: "#6B7B6B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {data.startLineAccuracy.map((b, i) => {
                  const near = Math.abs(parseFloat(b.bucket)) <= 1;
                  return <Cell key={i} fill={near ? MADE : "rgba(255,255,255,0.12)"} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}

function Stat({
  label,
  value,
  valueClass = "text-white",
  small = false,
}: {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
  small?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      <div className={`${small ? "text-base" : "text-2xl"} font-bold ${valueClass}`}>{value}</div>
    </div>
  );
}

/* ---------------- Start Line Analysis ---------------- */

function StartLineAnalysis({ data }: { data: SessionAnalytics }) {
  const W = 300;
  const H = 260;
  const cx = W / 2;
  const cy = H / 2 - 10;
  const maxDeg = 3;
  const maxR = 95;
  const rings = [1, 1.5, 3];
  const labels = [-3, -1.5, 0, 1.5, 3];

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <Label>Start Line Analysis</Label>
          <div className="mt-2 text-2xl font-bold text-[#22C55E]">
            {Math.abs(data.avgStartLineDeg)}° {data.avgStartLineDeg < 0 ? "Left" : "Right"}
          </div>
          <Label>Average Start Line</Label>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-[#22C55E]">{data.withinOneFiveDegPercent}%</div>
          <Label>Within 1.5°</Label>
        </div>
      </div>

      <div className="flex-1 mt-3 min-h-0 flex items-center justify-center">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full max-h-[280px]">
          {rings.map((deg) => (
            <circle
              key={deg}
              cx={cx}
              cy={cy}
              r={(deg / maxDeg) * maxR}
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeDasharray="4 4"
            />
          ))}

          {labels.map((deg) => (
            <text
              key={deg}
              x={cx + (deg / maxDeg) * maxR}
              y={cy + maxR + 18}
              textAnchor="middle"
              fontSize="10"
              fill="#6B7B6B"
            >
              {deg > 0 ? `+${deg}` : String(deg)}
            </text>
          ))}

          {data.startLinePoints.map((p, i) => {
            const r = (Math.abs(p.x) / maxDeg) * maxR;
            const t = ((p.y - 8) / 20) * Math.PI - Math.PI / 2;
            const angle = p.x < 0 ? Math.PI - t : t;
            const px = cx + r * Math.cos(angle);
            const py = cy + r * Math.sin(angle);
            return <circle key={i} cx={px} cy={py} r={5} fill={p.result === "made" ? MADE : MISS} opacity={0.95} />;
          })}
        </svg>
      </div>

      <div className="flex items-center justify-center gap-6 mt-2 text-xs">
        <LegendDot color={MADE} label="Made" />
        <LegendDot color={MISS} label="Missed" />
      </div>
    </Card>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-white/50">
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </div>
  );
}

/* ---------------- Speed Control ---------------- */

function SpeedControl({ data }: { data: SessionAnalytics }) {
  return (
    <Card>
      <Label>Speed Control</Label>
      <div className="mt-2 flex items-baseline gap-6">
        <div>
          <div className="text-3xl font-bold text-white">
            {data.avgSpeedMs} <span className="text-base font-normal text-white/40">m/s</span>
          </div>
          <Label>Avg Speed</Label>
        </div>
        <div>
          <div className="text-xl font-bold text-[#22C55E]">{data.optimalSpeedMs} m/s</div>
          <Label>Optimal</Label>
        </div>
      </div>

      <div className="mt-3">
        <Label>Speed Distribution</Label>
      </div>
      <div className="flex-1 min-h-0 mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.speedDistribution}>
            <XAxis dataKey="speed" tick={{ fill: "#6B7B6B", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Bar dataKey="count" fill={BLUE} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-3 text-center">
        <SpeedTag label="Too Slow" value={data.tooSlow} color="text-white/60" />
        <SpeedTag label="Good" value={data.good} color="text-[#22C55E]" />
        <SpeedTag label="Too Fast" value={data.tooFast} color="text-[#EF4444]" />
      </div>
    </Card>
  );
}

function SpeedTag({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg bg-black/20 border border-white/5 py-2">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">{label}</div>
    </div>
  );
}

/* ---------------- Putt Map ---------------- */

export function PuttMap({ data }: { data: SessionAnalytics }) {
  const madePct = Math.round((data.made / data.totalPutts) * 100);
  const missPct = 100 - madePct;

  const W = 400;
  const H = 320;
  const cx = W / 2;
  const cy = H / 2 + 10;
  const rx = 170;
  const ry = 130;

  return (
    <Card>
      <Label>Putt Map</Label>

      <div className="flex-1 mt-2 min-h-0 flex items-center justify-center">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full max-h-[280px]">
          <defs>
            <radialGradient id="greenGrad" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#1F5A2E" />
              <stop offset="70%" stopColor="#14381D" />
              <stop offset="100%" stopColor="#0B2211" />
            </radialGradient>
          </defs>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#greenGrad)" />

          {[
            { r: 0.33, label: "10ft" },
            { r: 0.66, label: "20ft" },
            { r: 1.0, label: "30ft" },
          ].map((ring, i) => (
            <g key={i}>
              <ellipse
                cx={cx}
                cy={cy}
                rx={rx * ring.r * 0.85}
                ry={ry * ring.r * 0.85}
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeDasharray="3 4"
              />
              <text
                x={cx}
                y={cy - ry * ring.r * 0.85 - 4}
                textAnchor="middle"
                fontSize="9"
                fill="rgba(255,255,255,0.4)"
              >
                {ring.label}
              </text>
            </g>
          ))}

          <g>
            <line x1={cx} y1={cy - ry + 20} x2={cx} y2={cy - ry - 18} stroke="#fff" strokeWidth={1.5} />
            <polygon
              points={`${cx},${cy - ry - 18} ${cx + 14},${cy - ry - 12} ${cx},${cy - ry - 6}`}
              fill={MADE}
            />
            <circle cx={cx} cy={cy - ry + 20} r={3} fill="#fff" />
          </g>

          {data.puttMap.map((p, i) => {
            const px = cx + p.x * rx * 0.9;
            const py = cy - ry * 0.85 + p.y * ry * 1.6;
            return <circle key={i} cx={px} cy={py} r={5} fill={p.result === "made" ? MADE : MISS} opacity={0.95} />;
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between mt-2 text-xs">
        <div className="text-[#22C55E] font-semibold">
          {data.made} Made ({madePct}%)
        </div>
        <div className="text-[#EF4444] font-semibold">
          {data.missed} Missed ({missPct}%)
        </div>
      </div>
    </Card>
  );
}
