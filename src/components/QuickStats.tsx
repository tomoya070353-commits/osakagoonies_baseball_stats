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
  gaugeGradient: string; // ゲージ用グラデーションクラス名
}

function StatCard({ label, value, sub, icon, iconColor, valueColor, pct = 0, gaugeGradient }: StatCardProps) {
  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } }
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.03, y: -3 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="relative flex-1 min-w-[130px] rounded-3xl p-4 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden"
    >
      {/* 背景ゲージ（Staggered Bar Fill with Gradient） */}
      {pct > 0 && (
        <motion.div
          className={`absolute inset-y-0 left-0 z-0 origin-left bg-gradient-to-r ${gaugeGradient} opacity-[0.08]`}
          style={{ width: `${pct}%` }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1.0, ease: "easeOut" as const }}
          viewport={{ once: true }}
        />
      )}

      {/* コンテンツを前面に */}
      <div className="relative z-10 pointer-events-none flex flex-col justify-between h-full min-h-[72px]">
        <div>
          <div className="flex justify-between items-start">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
            <div className={`opacity-20 -mt-1 -mr-1 ${iconColor}`}>{icon}</div>
          </div>
          <p className={`text-3xl font-extrabold tracking-tight leading-none mt-1.5 ${valueColor}`}>{value}</p>
        </div>
        {sub && <p className="text-slate-400 text-[10px] font-medium mt-2 leading-tight">{sub}</p>}
      </div>
    </motion.div>
  );
}

interface QuickStatsProps {
  player: PlayerStats;
}

export default function QuickStats({ player }: QuickStatsProps) {
  const stats = [
    {
      label: "打率",
      value: player.avg.toFixed(3).replace(/^0/, "."),
      sub: `${player.hits}安打 / ${player.atBatCount}打数`,
      icon: <Target size={22} strokeWidth={2.5} />,
      iconColor: "text-[#1e3a5f]",
      valueColor: "text-[#1e3a5f]",
      gaugeGradient: "from-[#1e3a5f] to-[#319795]",
    },
    {
      label: "打点",
      value: `${player.rbi}`,
      sub: `${player.games.length}試合`,
      icon: <Star size={22} strokeWidth={2.5} />,
      iconColor: "text-rose-500",
      valueColor: "text-rose-600",
      gaugeGradient: "from-rose-500 to-orange-500",
    },
    {
      label: "OPS",
      value: player.ops.toFixed(3).replace(/^0/, "."),
      sub: `OBP ${player.obp.toFixed(3).replace(/^0/, ".")} + SLG ${player.slg.toFixed(3).replace(/^0/, ".")}`,
      icon: <TrendingUp size={22} strokeWidth={2.5} />,
      iconColor: "text-[#1e3a5f]",
      valueColor: "text-[#1e3a5f]",
      gaugeGradient: "from-[#1e3a5f] to-indigo-500",
    },
    {
      label: "本塁打",
      value: `${player.homeRuns}`,
      sub: `${player.doubles}二塁打 ${player.triples}三塁打`,
      icon: <Zap size={22} strokeWidth={2.5} />,
      iconColor: "text-amber-500",
      valueColor: "text-amber-600",
      gaugeGradient: "from-amber-500 to-yellow-400",
    },
    {
      label: "盗塁",
      value: `${player.stolenBases}`,
      sub: `四球 ${player.walks}`,
      icon: <Wind size={22} strokeWidth={2.5} />,
      iconColor: "text-teal-500",
      valueColor: "text-teal-600",
      gaugeGradient: "from-teal-400 to-[#319795]",
    },
    {
      label: "三振率",
      value: `${(player.kRate * 100).toFixed(1)}%`,
      sub: `${player.strikeouts}三振 / ${player.plateAppearances}打席`,
      icon: <Trophy size={22} strokeWidth={2.5} />,
      iconColor: "text-slate-400",
      valueColor: "text-slate-700",
      gaugeGradient: "from-slate-400 to-slate-600",
      pct: Math.min((player.kRate * 100 * 2), 100),
    },
  ];

  // コンテナ全体のStagger定義
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } }
  };

  return (
    <div className="px-5">
      <h2 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-3">Quick Stats</h2>
      <motion.div
        className="grid grid-cols-2 gap-3"
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
                s.label === "本塁打" ? Math.min((player.homeRuns / 10) * 100, 100) : // 最大本塁打数をチームに合わせて10に調整
                  s.label === "打点" ? Math.min((player.rbi / 25) * 100, 100) :
                    s.label === "盗塁" ? Math.min((player.stolenBases / 10) * 100, 100) :
                      s.pct // 三振率
          } />
        ))}
      </motion.div>
    </div>
  );
}
