"use client";

import { motion } from "framer-motion";
import type { MonthlyAwardsData } from "@/lib/monthly-awards";
import { Award, Star, TrendingUp, Zap, Target } from "lucide-react";

interface MonthlyAwardsProps {
  data: MonthlyAwardsData | null;
}

export default function MonthlyAwards({ data }: MonthlyAwardsProps) {
  if (!data || !data.mvp) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400">
        <Award size={32} className="mb-2 opacity-50" />
        <p className="font-bold text-sm">月間MVP (データ収集中)</p>
        <p className="text-xs mt-1">試合データが蓄積されると自動選出されます</p>
      </div>
    );
  }

  // アニメーション設定
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: [0.9, 1.05, 1],
      rotate: [0, 2, -2, 0],
      y: 0,
      transition: { duration: 0.6, type: "spring" as const, stiffness: 200 }
    }
  };

  const shimmerVariants = {
    initial: { x: "-100%" },
    animate: { 
      x: "100%", 
      transition: { repeat: Infinity, duration: 2.5, ease: "linear" as const, repeatDelay: 1 } 
    }
  };

  const leaders = data.leaders;

  return (
    <div className="flex flex-col gap-3">
      {/* 🏆 MVP カード */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="relative bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 rounded-2xl p-[2px] shadow-lg overflow-hidden"
      >
        {/* シマーエフェクト */}
        <motion.div 
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
          className="absolute inset-0 z-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
        />

        <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-[14px] p-5 h-full flex flex-col">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-black tracking-wider uppercase border border-amber-200">
              <Star size={12} className="fill-amber-500 text-amber-500" />
              {data.targetMonth.replace("/", "年")}月度 MVP
            </div>
            <Award size={24} className="text-amber-500" />
          </div>

          <div className="flex items-center gap-4 my-2">
            <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-amber-700 text-2xl font-black shadow-inner shrink-0 relative">
              {data.mvp.name.charAt(0)}
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-0.5 shadow-sm">
                <div className="bg-amber-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
                  👑
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
                {data.mvp.name}
              </h2>
              <p className="text-xs text-amber-600 font-bold bg-amber-50 animate-pulse px-2 py-0.5 rounded-sm inline-block">
                Score: {data.mvp.score}
              </p>
            </div>
          </div>

          <div className="mt-3 py-3 border-t border-dashed border-amber-200">
            <p className="text-sm font-bold text-slate-700 text-center">
              月間成績: <span className="text-amber-600">打率{(data.mvp.avg).toFixed(3).replace(/^0/, "")}</span> / <span className="text-amber-600">{data.mvp.homeRuns}本</span> / <span className="text-amber-600">{data.mvp.rbi}打点</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* 🏅 月間リーダーズ (ベストナイン風) */}
      <div className="grid grid-cols-2 gap-2 mt-1">
        <LeaderCard title="月間首位打者" icon={<Target size={14} />} leader={leaders.avg} color="bg-blue-50 text-blue-700 border-blue-100" />
        <LeaderCard title="月間本塁打王" icon={<Zap size={14} />} leader={leaders.homeRuns} color="bg-red-50 text-red-700 border-red-100" />
        <LeaderCard title="月間打点王" icon={<Award size={14} />} leader={leaders.rbi} color="bg-orange-50 text-orange-700 border-orange-100" />
        <LeaderCard title="月間盗塁王" icon={<TrendingUp size={14} />} leader={leaders.stolenBases} color="bg-emerald-50 text-emerald-700 border-emerald-100" />
      </div>
    </div>
  );
}

function LeaderCard({ title, icon, leader, color }: { title: string, icon: React.ReactNode, leader: any, color: string }) {
  if (!leader) return null; // データがない部門は非表示（または "-" プレースホルダーでも可）

  return (
    <div className={`flex flex-col p-3 rounded-xl border ${color}`}>
      <div className="flex items-center gap-1.5 text-[10px] font-bold opacity-80 mb-1">
        {icon}
        {title}
      </div>
      <div className="flex justify-between items-end mt-1">
        <span className="font-black text-sm truncate pr-2">{leader.name}</span>
        <span className="text-xs font-bold shrink-0 bg-white/50 px-1.5 py-0.5 rounded">{leader.label}</span>
      </div>
    </div>
  );
}
