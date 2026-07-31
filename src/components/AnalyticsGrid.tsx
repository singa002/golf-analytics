// Dense 2x2 analytics grid. Originally the golfer Analytics tab; now reused as
// the per-student analytics view in Coach View. Restyled to the shared design
// system (#0D1512 cards, border-white/10, uppercase micro-labels).
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import type { SessionAnalytics } from "@/lib/analyticsService";

const ACCENT = "#22C55E"; // --golf-accent (also ACCENT / positive data)
const MISS = "#EF4444";
const BLUE = "#3B82F6";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#0D1512] border border-white/10 rounded-[12px] p-6 flex flex-col ${className}`}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="golf-label">{children}</div>
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
              stroke={ACCENT}
              strokeWidth={stroke}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={c}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="golf-display text-3xl text-white">{makePercent}%</div>
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
          <div className="text-base text-[#22C55E] font-semibold">
            {data.withinOneFiveDegPercent}% Within 1.5°
          </div>
        </div>
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.startLineAccuracy}>
              <XAxis dataKey="bucket" tick={{ fill: "#B0B3AF", fontSize: 14 }} axisLine={false} tickLine={false} />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {data.startLineAccuracy.map((b, i) => {
                  const near = Math.abs(parseFloat(b.bucket)) <= 1;
                  return <Cell key={i} fill={near ? ACCENT : "rgba(255,255,255,0.12)"} />;
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
    <div className="flex flex-col gap-1 min-w-0">
      <div className="golf-label-sm whitespace-nowrap">{label}</div>
      <div className={`${small ? "text-base" : "text-2xl"} golf-display ${valueClass}`}>{value}</div>
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
          <div className="mt-2 golf-display text-2xl text-[#22C55E]">
            {Math.abs(data.avgStartLineDeg)}° {data.avgStartLineDeg < 0 ? "Left" : "Right"}
          </div>
          <Label>Average Start Line</Label>
        </div>
        <div className="text-right">
          <div className="golf-display text-xl text-[#22C55E]">{data.withinOneFiveDegPercent}%</div>
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
              fontSize="14"
              fill="#B0B3AF"
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
            return <circle key={i} cx={px} cy={py} r={5} fill={p.result === "made" ? ACCENT : MISS} />;
          })}
        </svg>
      </div>

      <div className="flex items-center justify-center gap-6 mt-2 text-base">
        <LegendDot color={ACCENT} label="Made" />
        <LegendDot color={MISS} label="Missed" />
      </div>
    </Card>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 golf-text-secondary">
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
          <div className="golf-display text-3xl text-white">
            {data.avgSpeedMs} <span className="text-base font-normal golf-text-secondary">m/s</span>
          </div>
          <Label>Avg Speed</Label>
        </div>
        <div>
          <div className="golf-display text-xl text-[#22C55E]">{data.optimalSpeedMs} m/s</div>
          <Label>Optimal</Label>
        </div>
      </div>

      <div className="mt-3">
        <Label>Speed Distribution</Label>
      </div>
      <div className="flex-1 min-h-0 mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.speedDistribution}>
            <XAxis dataKey="speed" tick={{ fill: "#B0B3AF", fontSize: 14 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Bar dataKey="count" fill={BLUE} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-3 text-center">
        <SpeedTag label="Too Slow" value={data.tooSlow} color="golf-text-secondary" />
        <SpeedTag label="Good" value={data.good} color="text-[#22C55E]" />
        <SpeedTag label="Too Fast" value={data.tooFast} color="text-[#EF4444]" />
      </div>
    </Card>
  );
}

function SpeedTag({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg bg-black/20 border border-white/5 py-2">
      <div className={`golf-display text-lg ${color}`}>{value}</div>
      <div className="golf-label-sm">{label}</div>
    </div>
  );
}

/* ---------------- Putt Map ---------------- */

export function PuttMap({ data }: { data: SessionAnalytics }) {
  const madePct = Math.round((data.made / data.totalPutts) * 100);
  const missPct = 100 - madePct;

  return (
    <Card>
      <Label>Putt Map</Label>

      <div className="flex-1 mt-2 min-h-0 flex items-center justify-center">
        <div className="w-full h-full max-h-[280px] flex items-center justify-center">
          <SharedGreenView
            ballAngle={0}
            ballDistance={0.8}
            breakDirection="Right"
            showBall={false}
            showPredictedPath={false}
            celebrate={data.made > 0}
            putts={data.puttMap.map((p) => ({
              x: p.x,
              y: p.y * 1.3 - 0.6,
              result: p.result,
            }))}
          />
        </div>
      </div>


      <div className="flex items-center justify-between mt-2 text-base">
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
