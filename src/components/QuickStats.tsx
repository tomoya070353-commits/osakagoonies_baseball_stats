"use client";

import type { PlayerStats } from "@/types";
import { TrendingUp, Target, Zap, Wind, Trophy } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
}

function StatCard({ label, value, sub, icon, accent }: StatCardProps) {
  return (
    <div className={`relative flex-1 min-w-[130px] rounded-2xl p-4 bg-white/5 border border-white/10 overflow-hidden`}>
      <div className={`absolute top-3 right-3 opacity-20 ${accent}`}>{icon}</div>
      <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-black ${accent} leading-none`}>{value}</p>
      {sub && <p className="text-white/30 text-xs mt-1">{sub}</p>}
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
      accent: "text-emerald-400",
    },
    {
      label: "OPS",
      value: player.ops.toFixed(3).replace(/^0/, ""),
      sub: `OBP ${player.obp.toFixed(3).replace(/^0/, "")} + SLG ${player.slg.toFixed(3).replace(/^0/, "")}`,
      icon: <TrendingUp size={28} />,
      accent: "text-sky-400",
    },
    {
      label: "本塁打",
      value: `${player.homeRuns}`,
      sub: `${player.doubles}二塁打 ${player.triples}三塁打`,
      icon: <Zap size={28} />,
      accent: "text-yellow-400",
    },
    {
      label: "盗塁",
      value: `${player.stolenBases}`,
      sub: `打点 ${player.rbi}`,
      icon: <Wind size={28} />,
      accent: "text-violet-400",
    },
    {
      label: "三振率",
      value: `${(player.kRate * 100).toFixed(1)}%`,
      sub: `${player.strikeouts}三振 / ${player.plateAppearances}打席`,
      icon: <Trophy size={28} />,
      accent: "text-red-400",
    },
  ];

  return (
    <div className="px-5">
      <h2 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Quick Stats</h2>
      <div className="grid grid-cols-2 gap-2.5">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>
    </div>
  );
}
