"use client";

import { motion } from "framer-motion";
import { PlayerStats } from "@/types";
import { calculateNextGameMission } from "@/lib/kpi";

interface NextGameMissionProps {
  player: PlayerStats;
}

export default function NextGameMission({ player }: NextGameMissionProps) {
  const mission = calculateNextGameMission(player);

  if (!mission) return null;

  return (
    <div className="px-5 mb-2 mt-2">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className={`relative overflow-hidden p-4 rounded-3xl border-l-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)] ${
          mission.isSpecial
            ? "bg-gradient-to-r from-amber-500/8 via-amber-50/10 to-transparent border border-slate-100 border-l-amber-500"
            : "bg-white border border-slate-100 border-l-[#1e3a5f]"
        }`}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`text-[10px] font-black uppercase tracking-widest ${mission.isSpecial ? "text-amber-600" : "text-slate-400"}`}>
            {mission.title}
          </span>
        </div>
        <p className={`font-black text-[15px] sm:text-base leading-snug tracking-tight ${
          mission.isSpecial ? "text-amber-800" : "text-[#1e3a5f]"
        }`}>
          {mission.message}
        </p>
        
        {/* 装飾用背景アイコン */}
        {mission.isSpecial ? (
          <div className="absolute -right-4 -bottom-4 text-amber-500/20 text-6xl rotate-12 pointer-events-none select-none">
            👑
          </div>
        ) : (
          <div className="absolute -right-4 -bottom-4 text-[#1e3a5f]/5 text-6xl rotate-12 pointer-events-none select-none">
            🎯
          </div>
        )}
      </motion.div>
    </div>
  );
}
