"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import type { PlayerStats } from "@/types";

interface PlayerRadarProps {
  player: PlayerStats;
}

/* ── A〜F グレード変換 ───────────────────────────── */
function toGrade(score: number): { grade: string; color: string; bg: string } {
  if (score >= 80) return { grade: "A", color: "#1d4ed8", bg: "rgba(29,78,216,0.08)" };  // 青（Blue-700）
  if (score >= 60) return { grade: "B", color: "#0891b2", bg: "rgba(8,145,178,0.08)" };  // シアン
  if (score >= 40) return { grade: "C", color: "#059669", bg: "rgba(5,150,105,0.08)" };  // エメラルド
  if (score >= 20) return { grade: "D", color: "#d97706", bg: "rgba(217,119,6,0.08)" };   // アンバー
  if (score >= 1) return { grade: "E", color: "#ea580c", bg: "rgba(234,88,12,0.08)" };  // オレンジ
  return { grade: "F", color: "#dc2626", bg: "rgba(220,38,38,0.08)" };    // 赤
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
    { label: "ミート", score: player.meet },
    { label: "パワー", score: player.power },
    { label: "走力", score: player.speed },
    { label: "選球眼", score: player.eye },
    { label: "勝負強さ", score: player.clutch },
  ];

  const radarData = stats.map((s) => ({
    subject: s.label,
    value: s.score,
    fullMark: 100,
  }));

  const trajLabel = TRAJ_LABELS[player.trajectory] ?? "—";
  const trajColor =
    player.trajectory === 4 ? "#1d4ed8" :   // 4=大型アーク → 青
      player.trajectory === 3 ? "#0891b2" :   // 3=フライ打者 → シアン
        player.trajectory === 2 ? "#d97706" :   // 2=中間弾道  → アンバー
          "#dc2626";                               // 1=ゴロ打者  → 赤

  return (
    <div>
      <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
        Player Radar
      </h2>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ duration: 0.2 }}
        className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4"
      >
        <div className="flex gap-3 items-start">

          {/* ── 左: ステータス評価テーブル ── */}
          <div className="flex flex-col gap-1.5 w-[46%] shrink-0">

            {/* 弾道（数値表示） */}
            <div className="flex items-center justify-between rounded-xl px-3 py-2"
              style={{ background: `${trajColor}12` }}>
              <span className="text-slate-500 text-xs font-medium">弾道</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs" style={{ color: trajColor }}>{trajLabel}</span>
                <span className="font-black text-sm w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ color: trajColor, background: `${trajColor}20` }}>
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
                  <span className="text-slate-500 text-xs font-medium">{s.label}</span>
                  <div className="flex items-center gap-2">
                    {/* スコアバー */}
                    <div className="w-16 h-1.5 rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${s.score}%`, background: g.color }}
                      />
                    </div>
                    {/* グレードバッジ */}
                    <span
                      className="font-black text-base w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ color: g.color, background: `${g.color}18` }}>
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
                <PolarGrid stroke="rgba(16,185,129,0.20)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
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
                  fillOpacity={0.20}
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 3 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
