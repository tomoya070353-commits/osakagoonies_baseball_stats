"use client";

import { motion } from "framer-motion";
import { PlayerStats } from "@/types";
import { getWeeklyRivalMatchup } from "@/lib/rivals";

interface WeeklyRivalMatchupProps {
  players: PlayerStats[];
}

export default function WeeklyRivalMatchup({ players }: WeeklyRivalMatchupProps) {
  const matchup = getWeeklyRivalMatchup(players);

  if (!matchup) return null;

  return (
    <div className="px-5 mb-2 mt-1">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xl">🔥</span>
        <h2 className="text-sm font-black text-slate-800 tracking-tight">今週の注目カード</h2>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full ml-auto">
          Rival Matchup
        </span>
      </div>

      <div className="relative overflow-hidden rounded-2xl shadow-md bg-slate-900 border border-slate-800">
        {/* 背景のスプリットデザイン */}
        <div className="absolute inset-0 flex">
          <div className="w-1/2 h-full bg-gradient-to-br from-slate-800 to-slate-900 transform -skew-x-12 scale-110 origin-bottom-left" />
          <div className="w-1/2 h-full bg-gradient-to-tl from-red-900/40 to-slate-950 transform -skew-x-12 scale-110 origin-top-right border-l-4 border-red-500/50" />
        </div>

        <div className="relative p-5 py-6 flex justify-between items-center z-10">
          
          {/* Player A (Left) */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, delay: 0.1 }}
            className="flex flex-col items-center w-[40%]"
          >
            <div className="w-14 h-14 bg-slate-800 rounded-full border-2 border-slate-600 flex items-center justify-center text-xl font-bold text-white shadow-lg mb-2">
              {matchup.playerA.name.charAt(0)}
            </div>
            <p className="text-white font-black text-sm text-center truncate w-full">
              {matchup.playerA.name}
            </p>
            <p className="text-slate-400 text-xs mt-0.5 font-bold">
              {matchup.valueA}
            </p>
          </motion.div>

          {/* Player B (Right) */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, delay: 0.1 }}
            className="flex flex-col items-center w-[40%]"
          >
            <div className="w-14 h-14 bg-red-950 rounded-full border-2 border-red-800 flex items-center justify-center text-xl font-bold text-red-100 shadow-lg mb-2">
              {matchup.playerB.name.charAt(0)}
            </div>
            <p className="text-white font-black text-sm text-center truncate w-full">
              {matchup.playerB.name}
            </p>
            <p className="text-red-300 text-xs mt-0.5 font-bold">
              {matchup.valueB}
            </p>
          </motion.div>

          {/* VS Centerpiece */}
          <motion.div
            initial={{ scale: 2, y: -50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 10, delay: 0.4 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center"
          >
            <div className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              VS
            </div>
          </motion.div>

        </div>
        
        {/* Headline Banner */}
        <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.7 }}
           className="relative z-10 bg-black/60 backdrop-blur-sm border-t border-white/10 py-2 px-4 text-center"
        >
          <span className="text-yellow-400 font-bold text-xs tracking-wider">
            {matchup.headline}
          </span>
        </motion.div>

      </div>
    </div>
  );
}
