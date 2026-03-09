"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import type { PlayerStats } from "@/types";

interface PlayerRadarProps {
  player: PlayerStats;
}

/* ── A〜F グレード変換 ───────────────────────────── */
function toGrade(score: number): { grade: string; color: string; bg: string } {
  if (score >= 80) return { grade: "A", color: "#fbbf24", bg: "rgba(251,191,36,0.15)"  };
  if (score >= 60) return { grade: "B", color: "#10b981", bg: "rgba(16,185,129,0.12)"  };
  if (score >= 40) return { grade: "C", color: "#60a5fa", bg: "rgba(96,165,250,0.12)"  };
  if (score >= 20) return { grade: "D", color: "#a78bfa", bg: "rgba(167,139,250,0.12)" };
  if (score >= 1)  return { grade: "E", color: "#fb923c", bg: "rgba(249,115,22,0.12)"  };
  return               { grade: "F", color: "#f87171", bg: "rgba(248,113,113,0.12)"  };
}

/* 弾道（1〜4）→ 表示用 */
const TRAJ_LABELS: Record<number, string> = {
  1: "ゴロ打者",
  2: "中間弾道",
  3: "フライ打者",
  4: "大型アーク",
};

/* ── メインコンポーネント ─────────────────────────── */
export default function PlayerRadar({ player }: PlayerRadarProps) {
  const stats = [
    { label: "ミート",    score: player.meet    },
    { label: "パワー",    score: player.power   },
    { label: "走力",      score: player.speed   },
    { label: "選球眼",    score: player.eye     },
    { label: "勝負強さ",  score: player.clutch  },
  ];

  const radarData = stats.map((s) => ({
    subject: s.label,
    value:   s.score,
    fullMark: 100,
  }));

  const trajLabel = TRAJ_LABELS[player.trajectory] ?? "—";
  const trajColor =
    player.trajectory === 4 ? "#f87171" :
    player.trajectory === 3 ? "#a78bfa" :
    player.trajectory === 2 ? "#60a5fa" : "#10b981";

  return (
    <div>
      <h2 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">
        Player Radar
      </h2>
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
        <div className="flex gap-3 items-start">

          {/* ── 左: ステータス評価テーブル ── */}
          <div className="flex flex-col gap-1.5 w-[46%] shrink-0">

            {/* 弾道（数値表示） */}
            <div className="flex items-center justify-between rounded-xl px-3 py-2"
              style={{ background: `${trajColor}22` }}>
              <span className="text-white/60 text-xs font-medium">弾道</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs" style={{ color: trajColor }}>{trajLabel}</span>
                <span className="font-black text-sm w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ color: trajColor, background: `${trajColor}33` }}>
                  {player.trajectory}
                </span>
              </div>
            </div>

            {/* ミート〜勝負強さ（A〜F グレード） */}
            {stats.map((s) => {
              const g = toGrade(s.score);
              return (
                <div key={s.label}
                  className="flex items-center justify-between rounded-xl px-3 py-2"
                  style={{ background: g.bg }}>
                  <span className="text-white/60 text-xs font-medium">{s.label}</span>
                  <div className="flex items-center gap-2">
                    {/* スコアバー */}
                    <div className="w-16 h-1.5 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${s.score}%`, background: g.color }}
                      />
                    </div>
                    {/* グレードバッジ */}
                    <span
                      className="font-black text-base w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ color: g.color, background: `${g.color}22` }}>
                      {g.grade}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── 右: レーダーチャート ── */}
          <div className="flex-1 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%">
                <PolarGrid stroke="rgba(255,255,255,0.10)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "rgba(255,255,255,0.50)", fontSize: 10, fontWeight: 600 }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={false} 
                  axisLine={false} 
                />
                <Radar
                  name={player.name}
                  dataKey="value"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.25}
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 3 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    </div>
  );
}
