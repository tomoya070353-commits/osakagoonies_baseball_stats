"use client";

import type { PlayerStats } from "@/types";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import ContactChart from "@/components/ContactChart";
import { Users, Crosshair, Zap, Trophy, Wind } from "lucide-react";

interface TeamDashboardProps {
  players: PlayerStats[];
}

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex flex-col gap-1 relative overflow-hidden">
      <div className="absolute top-3 right-3 text-[#1e3a5f] opacity-10">{icon}</div>
      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-[#1e3a5f] leading-none">{value}</p>
      {sub && <p className="text-slate-400 text-xs">{sub}</p>}
    </div>
  );
}

export default function TeamDashboard({ players }: TeamDashboardProps) {
  if (players.length === 0) return null;

  // ── チーム集計 ──
  const totalHits      = players.reduce((s, p) => s + p.hits, 0);
  const totalHR        = players.reduce((s, p) => s + p.homeRuns, 0);
  const totalRBI       = players.reduce((s, p) => s + p.rbi, 0);
  const totalSB        = players.reduce((s, p) => s + p.stolenBases, 0);
  const teamAvg        = players.reduce((s, p) => s + p.avg, 0) / players.length;
  const totalPA        = players.reduce((s, p) => s + p.plateAppearances, 0);

  // ── チームレーダー（各指標の平均） ──
  const avgOf = (fn: (p: PlayerStats) => number) =>
    Math.round(players.reduce((s, p) => s + fn(p), 0) / players.length);

  const radarData = [
    { subject: "ミート",   value: avgOf(p => p.meet)   },
    { subject: "パワー",   value: avgOf(p => p.power)  },
    { subject: "走力",     value: avgOf(p => p.speed)  },
    { subject: "選球眼",   value: avgOf(p => p.eye)    },
    { subject: "勝負強さ", value: avgOf(p => p.clutch) },
  ];

  // ── チーム合算のContactChart用ダミーオブジェクト ──
  const teamAggregate = {
    grounders: players.reduce((s, p) => s + p.grounders, 0),
    flies:     players.reduce((s, p) => s + p.flies, 0),
    liners:    players.reduce((s, p) => s + p.liners, 0),
  } as PlayerStats;

  return (
    <div className="flex flex-col gap-6 py-4 pb-8">
      {/* ヘッダー */}
      <div className="px-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs mb-3 border border-[#1e3a5f]/20">
          <Users size={12} />
          <span>{players.length}名登録</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">チーム</h1>
        <p className="text-slate-400 text-sm mt-1">Osaka Goonies — 総合成績</p>
      </div>

      {/* スタッツカードグリッド */}
      <div className="px-5">
        <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Team Stats</h2>
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard label="チーム打率" value={teamAvg.toFixed(3).replace(/^0/, "")} sub={`総打席 ${totalPA}`} icon={<Crosshair size={28} />} />
          <StatCard label="総安打" value={`${totalHits}`} sub="チーム合計" icon={<Trophy size={28} />} />
          <StatCard label="総本塁打" value={`${totalHR}`} sub="チーム合計" icon={<Zap size={28} />} />
          <StatCard label="総打点" value={`${totalRBI}`} sub="チーム合計" icon={<Trophy size={28} />} />
          <StatCard label="総盗塁" value={`${totalSB}`} sub="チーム合計" icon={<Wind size={28} />} />
        </div>
      </div>

      {/* チームレーダーチャート */}
      <div className="px-5">
        <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Team Radar (平均値)</h2>
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%">
                <PolarGrid stroke="rgba(16,185,129,0.20)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="チーム平均"
                  dataKey="value"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.22}
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 3 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          {/* 各指標の数値 */}
          <div className="grid grid-cols-5 gap-1 mt-2">
            {radarData.map((d) => (
              <div key={d.subject} className="flex flex-col items-center">
                <span className="text-slate-400 text-[10px]">{d.subject}</span>
                <span className="text-[#1e3a5f] font-black text-sm">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* フライ・ゴロ比率 */}
      <div className="px-5">
        <ContactChart player={teamAggregate} />
      </div>
    </div>
  );
}
