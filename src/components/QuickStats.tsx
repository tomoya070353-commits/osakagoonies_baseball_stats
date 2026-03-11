"use client";

import type { PlayerStats } from "@/types";
import { motion } from "framer-motion";
import { TrendingUp, Target, Zap, Wind, Trophy, Star } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  iconColor: string;
  valueColor: string;
  pct?: number; // ゲージ用相対値（0〜100）
}

function StatCard({ label, value, sub, icon, iconColor, valueColor, pct = 0 }: StatCardProps) {
  // アイテム単位のアニメーションバリアント
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } }
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
      className="relative flex-1 min-w-[130px] rounded-2xl p-4 bg-white border border-slate-200 shadow-sm overflow-hidden"
    >
      {/* 背景ゲージ（Staggered Bar Fill） */}
      {pct > 0 && (
        <motion.div
          className="absolute inset-0 bg-slate-100 z-0 origin-left"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: pct / 100 }}
          transition={{ duration: 0.8, ease: "easeOut" as const }}
          viewport={{ once: true }}
        />
      )}

      {/* コンテンツを前面に */}
      <div className="relative z-10 pointer-events-none">
        <div className={`absolute -top-1 -right-1 opacity-15 ${iconColor}`}>{icon}</div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-2xl font-black leading-none ${valueColor}`}>{value}</p>
        {sub && <p className="text-slate-400 text-xs mt-1">{sub}</p>}
      </div>
    </motion.div>
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
      pct: Math.min((player.kRate * 100 * 2), 100), // 三振率は低さが良い場合もあるが、発生率として可視化
    },
  ];

  // コンテナ全体のStagger定義
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 } }
  };

  return (
    <div className="px-5">
      <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Quick Stats</h2>
      <motion.div
        className="grid grid-cols-2 gap-2.5"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {stats.map((s) => (
          <StatCard key={s.label} {...s} pct={
            // 各項目のおおよそのパーセント計算（仮の最大値に基づく）
            s.label === "打率" ? Math.min((player.avg / 0.400) * 100, 100) :
              s.label === "OPS" ? Math.min((player.ops / 1.200) * 100, 100) :
                s.label === "本塁打" ? Math.min((player.homeRuns / 40) * 100, 100) :
                  s.label === "打点" ? Math.min((player.rbi / 100) * 100, 100) :
                    s.label === "盗塁" ? Math.min((player.stolenBases / 30) * 100, 100) :
                      s.pct // 上記で定義した三振率
          } />
        ))}
      </motion.div>
    </div>
  );
}
