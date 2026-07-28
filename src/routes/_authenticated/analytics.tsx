import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
} from "recharts";
import { getSessionAnalytics } from "@/lib/analyticsService";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Putt Vector" },
      {
        name: "description",
        content:
          "Session analytics for putting: make %, start line, speed control, and putt map.",
      },
      { property: "og:title", content: "Analytics — Putt Vector" },
      {
        property: "og:description",
        content: "Dark sports analytics dashboard for your putting sessions.",
      },
    ],
  }),
  component: AnalyticsPage,
});

const MADE = "#22C55E";
const MISS = "#EF4444";
const BLUE = "#3B82F6";

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-card rounded-2xl p-5 flex flex-col ${className}`}
      style={{ backgroundColor: "#1C1C1E" }}
    >
      {children}
    </div>
  );
}

function AnalyticsPage() {
  const data = getSessionAnalytics();

  return (
    <div className="p-4 h-full">
      <h1 className="sr-only">Session Analytics</h1>
      <div className="grid grid-cols-2 grid-rows-2 gap-4 h-[calc(100vh-9rem)]">
        <SessionSummary data={data} />
        <StartLineAnalysis data={data} />
        <SpeedControl data={data} />
        <PuttMap data={data} />
      </div>
    </div>
  );
}

/* ---------------- Session Summary ---------------- */

function SessionSummary({ data }: { data: ReturnType<typeof getSessionAnalytics> }) {
  const { makePercent, totalPutts, made, missed } = data;
  const size = 140;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (makePercent / 100) * c;

  return (
    <Card>
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
        Session Summary
      </div>
      <div className="flex items-center gap-6">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke="#2A2A2C"
              strokeWidth={stroke}
              fill="none"
            />
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
            <div className="text-3xl font-bold text-foreground">{makePercent}%</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Make %
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 flex-1">
          <Stat label="Total Putts" value={totalPutts} />
          <Stat label="Made" value={made} valueClass="text-[#22C55E]" />
          <Stat label="Miss" value={missed} valueClass="text-[#EF4444]" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mt-5">
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

      <div className="mt-5 flex-1 flex flex-col justify-end">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Start Line Accuracy
          </div>
          <div className="text-xs text-[#22C55E] font-semibold">
            {data.withinOneFiveDegPercent}% Within 1.5°
          </div>
        </div>
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.startLineAccuracy}>
              <XAxis
                dataKey="bucket"
                tick={{ fill: "#68686E", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {data.startLineAccuracy.map((b, i) => {
                  const near = Math.abs(parseFloat(b.bucket)) <= 1;
                  return <Cell key={i} fill={near ? MADE : "#3A3A3D"} />;
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
  valueClass = "text-foreground",
  small = false,
}: {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
  small?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={`${small ? "text-base" : "text-2xl"} font-semibold ${valueClass}`}>
        {value}
      </div>
    </div>
  );
}

/* ---------------- Start Line Analysis ---------------- */

function StartLineAnalysis({ data }: { data: ReturnType<typeof getSessionAnalytics> }) {
  const made = data.startLinePoints.filter((p) => p.result === "made");
  const miss = data.startLinePoints.filter((p) => p.result === "missed");
  const domainX: [number, number] = [-3.5, 3.5];
  const domainY: [number, number] = [0, 32];

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Start Line Analysis
          </div>
          <div className="mt-2 text-2xl font-bold text-[#22C55E]">
            {Math.abs(data.avgStartLineDeg)}° {data.avgStartLineDeg < 0 ? "Left" : "Right"}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Average Start Line
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-[#22C55E]">
            {data.withinOneFiveDegPercent}%
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Within 1.5°
          </div>
        </div>
      </div>

      <div className="flex-1 mt-3 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <XAxis
              type="number"
              dataKey="x"
              domain={domainX}
              ticks={[-3, -1.5, 0, 1.5, 3]}
              tick={{ fill: "#68686E", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              label={{
                value: "Degrees",
                position: "insideBottom",
                offset: -2,
                fill: "#68686E",
                fontSize: 10,
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={domainY}
              tick={{ fill: "#68686E", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <ZAxis range={[50, 50]} />
            {/* Reference rings via extra scatter of invisible points is complex;
                instead we render dashed vertical guide lines through custom overlay. */}
            <Scatter data={made} fill={MADE} />
            <Scatter data={miss} fill={BLUE} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-2 text-xs">
        <LegendDot color={MADE} label="Made" />
        <LegendDot color={BLUE} label="Missed" />
      </div>
    </Card>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <span
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </div>
  );
}

/* ---------------- Speed Control ---------------- */

function SpeedControl({ data }: { data: ReturnType<typeof getSessionAnalytics> }) {
  return (
    <Card>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">
        Speed Control
      </div>
      <div className="mt-2 flex items-baseline gap-6">
        <div>
          <div className="text-3xl font-bold text-foreground">
            {data.avgSpeedMs} <span className="text-base font-normal text-muted-foreground">m/s</span>
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Avg Speed
          </div>
        </div>
        <div>
          <div className="text-xl font-semibold text-[#22C55E]">
            {data.optimalSpeedMs} m/s
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Optimal
          </div>
        </div>
      </div>

      <div className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
        Speed Distribution
      </div>
      <div className="flex-1 min-h-0 mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.speedDistribution}>
            <XAxis
              dataKey="speed"
              tick={{ fill: "#68686E", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Bar dataKey="count" fill={BLUE} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-3 text-center">
        <SpeedTag label="Too Slow" value={data.tooSlow} color="text-muted-foreground" />
        <SpeedTag label="Good" value={data.good} color="text-[#22C55E]" />
        <SpeedTag label="Too Fast" value={data.tooFast} color="text-[#EF4444]" />
      </div>
    </Card>
  );
}

function SpeedTag({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-lg bg-[#131315] py-2">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

/* ---------------- Putt Map ---------------- */

function PuttMap({ data }: { data: ReturnType<typeof getSessionAnalytics> }) {
  const madePct = Math.round((data.made / data.totalPutts) * 100);
  const missPct = 100 - madePct;

  // SVG coordinate system
  const W = 400;
  const H = 320;
  const cx = W / 2;
  const cy = H / 2 + 10;
  const rx = 170;
  const ry = 130;

  return (
    <Card>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">
        Putt Map
      </div>

      <div className="flex-1 mt-2 min-h-0 flex items-center justify-center">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full max-h-[260px]">
          <defs>
            <radialGradient id="greenGrad" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#1F5A2E" />
              <stop offset="70%" stopColor="#14381D" />
              <stop offset="100%" stopColor="#0B2211" />
            </radialGradient>
          </defs>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#greenGrad)" />

          {/* Distance rings */}
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

          {/* Flag at top center */}
          <g>
            <line x1={cx} y1={cy - ry + 20} x2={cx} y2={cy - ry - 18} stroke="#fff" strokeWidth={1.5} />
            <polygon
              points={`${cx},${cy - ry - 18} ${cx + 14},${cy - ry - 12} ${cx},${cy - ry - 6}`}
              fill={MADE}
            />
            <circle cx={cx} cy={cy - ry + 20} r={3} fill="#fff" />
          </g>

          {/* Putt dots */}
          {data.puttMap.map((p, i) => {
            const px = cx + p.x * rx * 0.9;
            const py = cy - ry * 0.85 + p.y * ry * 1.6;
            return (
              <circle
                key={i}
                cx={px}
                cy={py}
                r={5}
                fill={p.result === "made" ? MADE : MISS}
                opacity={0.95}
              />
            );
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
