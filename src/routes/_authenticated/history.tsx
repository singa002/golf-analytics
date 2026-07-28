import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from "recharts";
import { getSessionHistory, type SessionSummary } from "@/lib/historyService";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [
      { title: "History — Putt Vector" },
      { name: "description", content: "Browse past putting sessions and review detailed analytics for each round." },
      { property: "og:title", content: "History — Putt Vector" },
      { property: "og:description", content: "Session history with per-session putting analytics." },
    ],
  }),
  component: HistoryPage,
});

const MADE = "#22C55E";
const MISS = "#EF4444";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`} style={{ backgroundColor: "#1C1C1E" }}>
      {children}
    </div>
  );
}

function makePctColor(p: number) {
  if (p >= 70) return "#22C55E";
  if (p >= 60) return "#EAB308";
  return "#EF4444";
}

function MiniGauge({ pct, size = 44 }: { pct: number; size?: number }) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const color = makePctColor(pct);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#2A2A2C" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} strokeLinecap="round" fill="none" strokeDasharray={c} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-foreground">
        {pct}%
      </div>
    </div>
  );
}

function HistoryPage() {
  const sessions = getSessionHistory();
  const [selectedId, setSelectedId] = useState(sessions[0].id);
  const selected = sessions.find((s) => s.id === selectedId) ?? sessions[0];

  return (
    <div className="p-4 h-full">
      <h1 className="sr-only">Session History</h1>
      <div className="grid grid-cols-[380px_1fr] gap-4 h-[calc(100vh-9rem)]">
        {/* Left column */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-3 px-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">History</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {sessions.map((s) => {
              const active = s.id === selectedId;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={`w-full text-left rounded-2xl p-4 transition border-l-4 ${
                    active ? "border-[#22C55E]" : "border-transparent"
                  }`}
                  style={{ backgroundColor: "#1C1C1E" }}
                >
                  <div className="flex items-center gap-4">
                    <MiniGauge pct={s.makePercent} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground">{s.date}</div>
                      <div className="text-[11px] text-muted-foreground">{s.time}</div>
                      <div className="mt-2 flex gap-3 text-[11px] text-muted-foreground">
                        <span><span className="text-foreground font-semibold">{s.totalPutts}</span> putts</span>
                        <span><span className="text-foreground font-semibold">{s.avgDistanceFt}</span> ft</span>
                        <span><span className="text-foreground font-semibold">{s.avgSpeedMs}</span> m/s</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column - detail */}
        <SessionDetail session={selected} />
      </div>
    </div>
  );
}

function SessionDetail({ session }: { session: SessionSummary }) {
  const size = 130;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (session.makePercent / 100) * c;
  const color = makePctColor(session.makePercent);

  return (
    <Card className="overflow-y-auto flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Session</div>
          <div className="text-2xl font-bold text-foreground">{session.date}</div>
          <div className="text-sm text-muted-foreground">{session.time}</div>
        </div>
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} stroke="#2A2A2C" strokeWidth={stroke} fill="none" />
            <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} strokeLinecap="round" fill="none" strokeDasharray={c} strokeDashoffset={offset} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-foreground">{session.makePercent}%</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Make</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <StatBox label="Total Putts" value={session.totalPutts} />
        <StatBox label="Made" value={session.made} valueClass="text-[#22C55E]" />
        <StatBox label="Missed" value={session.missed} valueClass="text-[#EF4444]" />
        <StatBox label="Avg Distance" value={`${session.avgDistanceFt} ft`} />
        <StatBox label="Avg Speed" value={`${session.avgSpeedMs} m/s`} />
        <StatBox label="Avg Start Line" value={`${Math.abs(session.avgStartLineDeg)}° ${session.avgStartLineDeg < 0 ? "Left" : "Right"}`} />
        <StatBox label="Avg Break" value={`${Math.abs(session.avgBreakDeg)}° ${session.avgBreakDeg < 0 ? "Left" : "Right"}`} />
        <StatBox label="Within 1.5°" value={`${Math.round((session.startLineAccuracy.filter(b => Math.abs(parseFloat(b.bucket)) <= 1).reduce((a, b) => a + b.count, 0) / session.startLineAccuracy.reduce((a, b) => a + b.count, 0)) * 100)}%`} valueClass="text-[#22C55E]" />
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="rounded-xl p-3" style={{ backgroundColor: "#131315" }}>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Putt Map</div>
          <PuttMapSvg session={session} />
        </div>
        <div className="rounded-xl p-3 flex flex-col" style={{ backgroundColor: "#131315" }}>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Start Line Accuracy</div>
          <div className="flex-1 min-h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={session.startLineAccuracy}>
                <XAxis dataKey="bucket" tick={{ fill: "#68686E", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {session.startLineAccuracy.map((b, i) => {
                    const near = Math.abs(parseFloat(b.bucket)) <= 1;
                    return <Cell key={i} fill={near ? MADE : "#3A3A3D"} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  );
}

function StatBox({ label, value, valueClass = "text-foreground" }: { label: string; value: React.ReactNode; valueClass?: string }) {
  return (
    <div className="rounded-xl p-3" style={{ backgroundColor: "#131315" }}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-lg font-semibold mt-1 ${valueClass}`}>{value}</div>
    </div>
  );
}

function PuttMapSvg({ session }: { session: SessionSummary }) {
  const W = 300;
  const H = 220;
  const cx = W / 2;
  const cy = H / 2 + 5;
  const rx = 130;
  const ry = 90;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      <defs>
        <radialGradient id="greenGradHistory" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#1F5A2E" />
          <stop offset="70%" stopColor="#14381D" />
          <stop offset="100%" stopColor="#0B2211" />
        </radialGradient>
      </defs>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#greenGradHistory)" />
      {[0.4, 0.75].map((f, i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={rx * f} ry={ry * f} fill="none" stroke="rgba(255,255,255,0.1)" strokeDasharray="3 4" />
      ))}
      {/* Flag */}
      <line x1={cx} y1={cy - ry + 15} x2={cx} y2={cy - ry - 14} stroke="#fff" strokeWidth={1.5} />
      <polygon points={`${cx},${cy - ry - 14} ${cx + 12},${cy - ry - 8} ${cx},${cy - ry - 2}`} fill={MADE} />
      <circle cx={cx} cy={cy - ry + 15} r={2.5} fill="#fff" />
      {session.puttMap.map((p, i) => {
        const px = cx + p.x * rx * 0.85;
        const py = cy - ry * 0.75 + p.y * ry * 1.4;
        return <circle key={i} cx={px} cy={py} r={4} fill={p.result === "made" ? MADE : MISS} opacity={0.95} />;
      })}
    </svg>
  );
}
