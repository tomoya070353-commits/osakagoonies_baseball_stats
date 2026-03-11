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
    <div className="px-5 mb-1 mt-2">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className={`relative overflow-hidden p-4 rounded-xl shadow-sm border-l-4 ${
          mission.isSpecial
            ? "bg-gradient-to-r from-amber-50 to-orange-50 border-orange-400"
            : "bg-white border-blue-500"
        }`}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`text-sm font-bold tracking-tight ${mission.isSpecial ? "text-orange-600" : "text-slate-500"}`}>
            {mission.title}
          </span>
        </div>
        <p className={`font-extrabold text-[15px] sm:text-base leading-snug ${
          mission.isSpecial ? "text-orange-700" : "text-blue-700"
        }`}>
          {mission.message}
        </p>
        
        {/* 装飾用背景アイコン */}
        {mission.isSpecial && (
          <div className="absolute -right-4 -bottom-4 text-orange-200/50 text-6xl rotate-12 pointer-events-none select-none">
            👑
          </div>
        )}
      </motion.div>
    </div>
  );
}
