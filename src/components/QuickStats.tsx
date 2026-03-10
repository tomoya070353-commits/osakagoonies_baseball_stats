"use client";

import type { PlayerStats } from "@/types";
import { TrendingUp, Target, Zap, Wind, Trophy, Star } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  iconColor: string;
  valueColor: string;
}

function StatCard({ label, value, sub, icon, iconColor, valueColor }: StatCardProps) {
  return (
    <div className="relative flex-1 min-w-[130px] rounded-2xl p-4 bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div className={`absolute top-3 right-3 opacity-15 ${iconColor}`}>{icon}</div>
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-black leading-none ${valueColor}`}>{value}</p>
      {sub && <p className="text-slate-400 text-xs mt-1">{sub}</p>}
    </div>
  );
}

interface QuickStatsProps {
  player: PlayerStats;
}

export default function QuickStats({ player }: QuickStatsProps) {
  const stats: StatCardProps[] = [
    {
      label: "打率",
      value: player.avg.toFixed(3).replace(/^0/, ""),
      sub: `${player.hits}安打 / ${player.atBatCount}打数`,
      icon: <Target size={28} />,
      iconColor: "text-[#1e3a5f]",
      valueColor: "text-[#1e3a5f]",
    },
    {
      label: "打点",
      value: `${player.rbi}`,
      sub: `${player.games.length}試合`,
      icon: <Star size={28} />,
      iconColor: "text-[#dc2626]",
      valueColor: "text-[#dc2626]",
    },
    {
      label: "OPS",
      value: player.ops.toFixed(3).replace(/^0/, ""),
      sub: `OBP ${player.obp.toFixed(3).replace(/^0/, "")} + SLG ${player.slg.toFixed(3).replace(/^0/, "")}`,
      icon: <TrendingUp size={28} />,
      iconColor: "text-[#1e3a5f]",
      valueColor: "text-[#1e3a5f]",
    },
    {
      label: "本塁打",
      value: `${player.homeRuns}`,
      sub: `${player.doubles}二塁打 ${player.triples}三塁打`,
      icon: <Zap size={28} />,
      iconColor: "text-amber-500",
      valueColor: "text-amber-600",
    },
    {
      label: "盗塁",
      value: `${player.stolenBases}`,
      sub: `四球 ${player.walks}`,
      icon: <Wind size={28} />,
      iconColor: "text-slate-400",
      valueColor: "text-slate-700",
    },
    {
      label: "三振率",
      value: `${(player.kRate * 100).toFixed(1)}%`,
      sub: `${player.strikeouts}三振 / ${player.plateAppearances}打席`,
      icon: <Trophy size={28} />,
      iconColor: "text-slate-400",
      valueColor: "text-slate-700",
    },
  ];

  return (
    <div className="px-5">
      <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Quick Stats</h2>
      <div className="grid grid-cols-2 gap-2.5">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>
    </div>
  );
}
