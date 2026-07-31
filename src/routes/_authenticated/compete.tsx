import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/compete")({
  head: () => ({ meta: [{ title: "Compete — Putt Vector" }] }),
  component: ComparePage,
});

type ChallengeType = "ACCURACY" | "STREAK" | "SPEED";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  daysLeft: number;
  participants: number;
  yourScore?: string;
  joined: boolean;
}

/** Your current make streak — shared with the Dashboard hero stats. */
export const YOUR_MAKE_STREAK = 8;

const challenges: Challenge[] = [
  {
    id: "streak",
    title: "Make Streak King",
    description: "Make the most consecutive putts without a miss.",
    type: "STREAK",
    daysLeft: 3,
    participants: 47,
    yourScore: `${YOUR_MAKE_STREAK} in a row`,
    joined: true,
  },
  {
    id: "speed",
    title: "Speed Control Master",
    description: "Keep all putts within 0.2 m/s of optimal speed.",
    type: "SPEED",
    daysLeft: 5,
    participants: 32,
    joined: false,
  },
  {
    id: "accuracy",
    title: "Weekly Make % Leader",
    description: "Highest make percentage across all sessions this week.",
    type: "ACCURACY",
    daysLeft: 2,
    participants: 68,
    yourScore: "68%",
    joined: true,
  },
];

type Trend = "up" | "down" | "neutral";
interface LeaderRow {
  rank: number;
  name: string;
  score: string;
  sessions: number;
  trend: Trend;
  medal?: string;
  you?: boolean;
}

const leaderboards: Record<string, LeaderRow[]> = {
  streak: [
    { rank: 1, name: "Tyler M.", score: "14 streak", sessions: 12, trend: "up", medal: "🥇" },
    { rank: 2, name: "Sarah K.", score: "12 streak", sessions: 9, trend: "up", medal: "🥈" },
    { rank: 3, name: "James R.", score: "10 streak", sessions: 15, trend: "neutral", medal: "🥉" },
    { rank: 4, name: "Maria L.", score: "9 streak", sessions: 7, trend: "up" },
    { rank: 5, name: "Dheeraj S.", score: `${YOUR_MAKE_STREAK} streak`, sessions: 5, trend: "up", you: true },
    { rank: 6, name: "Chris P.", score: "7 streak", sessions: 11, trend: "down" },
    { rank: 7, name: "Alex T.", score: "6 streak", sessions: 8, trend: "neutral" },
  ],
  speed: [
    { rank: 1, name: "Tyler M.", score: "92%", sessions: 12, trend: "up", medal: "🥇" },
    { rank: 2, name: "Sarah K.", score: "88%", sessions: 9, trend: "up", medal: "🥈" },
    { rank: 3, name: "James R.", score: "84%", sessions: 15, trend: "neutral", medal: "🥉" },
    { rank: 4, name: "Maria L.", score: "80%", sessions: 7, trend: "up" },
    { rank: 5, name: "Dheeraj S.", score: "76%", sessions: 5, trend: "up", you: true },
    { rank: 6, name: "Chris P.", score: "72%", sessions: 11, trend: "down" },
    { rank: 7, name: "Alex T.", score: "68%", sessions: 8, trend: "neutral" },
  ],
  accuracy: [
    { rank: 1, name: "Tyler M.", score: "82%", sessions: 12, trend: "up", medal: "🥇" },
    { rank: 2, name: "Sarah K.", score: "79%", sessions: 9, trend: "up", medal: "🥈" },
    { rank: 3, name: "James R.", score: "76%", sessions: 15, trend: "neutral", medal: "🥉" },
    { rank: 4, name: "Maria L.", score: "71%", sessions: 7, trend: "up" },
    { rank: 5, name: "Dheeraj S.", score: "68%", sessions: 5, trend: "up", you: true },
    { rank: 6, name: "Chris P.", score: "65%", sessions: 11, trend: "down" },
    { rank: 7, name: "Alex T.", score: "63%", sessions: 8, trend: "neutral" },
  ],
};

const typeColors: Record<ChallengeType, string> = {
  ACCURACY: "bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/40",
  STREAK: "bg-[#34D399]/20 text-[#34D399] border-[#34D399]/40",
  SPEED: "bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40",
};

function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === "up") return <TrendingUp className="w-4 h-4 text-[#34D399]" />;
  if (trend === "down") return <TrendingDown className="w-4 h-4 text-[#EF4444]" />;
  return <Minus className="w-4 h-4 golf-text-secondary" />;
}

function ComparePage() {
  const [activeChallenge, setActiveChallenge] = useState<string>("accuracy");
  const rows = leaderboards[activeChallenge];
  const activeName = challenges.find((c) => c.id === activeChallenge)?.title ?? "";

  return (
    <div className="h-full w-full p-6 overflow-hidden">
      <div className="grid grid-cols-2 gap-6 h-full">
        {/* LEFT — Active Challenges */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-[#34D399]" />
            <h2 className="golf-label">ACTIVE CHALLENGES</h2>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {challenges.map((c) => (
              <div
                key={c.id}
                className="bg-[#0D1512] rounded-[12px] p-4 border border-white/10"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-white font-bold text-lg">{c.title}</h3>
                    <p className="golf-text-secondary text-sm mt-0.5">{c.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`text-base font-bold px-2 py-1 rounded-full border ${typeColors[c.type]}`}>
                    {c.type}
                  </span>
                  <span className="text-base font-bold px-2 py-1 rounded-full bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40">
                    {c.daysLeft} DAYS LEFT
                  </span>
                  <span className="text-base golf-text-secondary">{c.participants} golfers competing</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    {c.yourScore ? (
                      <>
                        <span className="golf-label">Your Score</span>
                        <div className="golf-display text-base text-white">{c.yourScore}</div>
                      </>
                    ) : (
                      <span className="golf-text-secondary text-base">Not joined</span>
                    )}
                  </div>
                  {c.joined ? (
                    <span className="text-sm font-bold px-3 py-1.5 rounded-full text-[#34D399] border border-[#34D399]">
                      COMPETING
                    </span>
                  ) : (
                    <button className="golf-accent-glow text-sm font-bold px-4 py-2 rounded-lg border border-[#34D399] bg-[#34D399] text-black hover:bg-[#6EE7B7] transition">
                      JOIN CHALLENGE
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Leaderboard */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-[#34D399]" />
            <h2 className="golf-label">LEADERBOARD</h2>
            <span className="text-base golf-text-secondary">— {activeName}</span>
          </div>
          <div className="flex gap-2 mb-3">
            {challenges.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveChallenge(c.id)}
                className={`text-base font-semibold px-3 py-1.5 rounded-full transition ${
                  activeChallenge === c.id
                    ? "golf-accent-glow bg-[#34D399] text-black"
                    : "bg-[#0D1512] golf-text-secondary hover:text-white border border-white/10"
                }`}
              >
                {c.type}
              </button>
            ))}
          </div>

          <div className="bg-[#0D1512] rounded-[12px] border border-white/10 overflow-hidden flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {rows.map((r) => (
                <div
                  key={r.rank}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    r.you ? "bg-[#34D399]/10 border-l-2 border-[#34D399]" : ""
                  }`}
                >
                  <div className="w-8 text-center">
                    {r.medal ? (
                      <span className="text-xl">{r.medal}</span>
                    ) : (
                      <span className="text-[#F59E0B] font-bold">#{r.rank}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${r.you ? "text-[#34D399]" : "text-white"}`}>
                      {r.name} {r.you && <span className="text-base text-[#34D399] ml-1">YOU</span>}
                    </div>
                    <div className="text-base golf-text-secondary">{r.sessions} sessions</div>
                  </div>
                  <div className="text-white golf-display text-lg">{r.score}</div>
                  <TrendIcon trend={r.trend} />
                </div>
              ))}
            </div>
          </div>

          {/* Your stats */}
          <div className="mt-3 bg-[#0D1512] rounded-[12px] border border-white/10 p-4 grid grid-cols-4 gap-4">
            {[
              { label: "Your Rank", value: "#5" },
              { label: "Best Score", value: "68%" },
              { label: "Completed", value: "2" },
              { label: "Active Streak", value: "3 days" },
            ].map((s) => (
              <div key={s.label}>
                <div className="golf-label-sm whitespace-nowrap">{s.label}</div>
                <div className="golf-display text-white text-xl mt-1">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
