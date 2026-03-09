"use client";

import type { PlayerStats } from "@/types";
import { MapPin, Hash } from "lucide-react";

interface PlayerHeaderProps {
  player: PlayerStats;
}

export default function PlayerHeader({ player }: PlayerHeaderProps) {
  return (
    <div className="relative px-5 pt-8 pb-6 overflow-hidden">
      {/* 背景グラデーション */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/40 via-transparent to-transparent pointer-events-none" />

      {/* ゲーム数バッジ */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs mb-4 border border-white/10">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        {player.games.length} GAMES
      </div>

      {/* 選手名 */}
      <h1 className="text-4xl font-black text-white tracking-tight leading-none">
        {player.name}
      </h1>

      {/* 守備位置・打順 */}
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5 text-white/60 text-sm">
          <MapPin size={13} className="text-emerald-400" />
          <span>{player.mostFrequentPosition}</span>
        </div>
        <div className="w-px h-3 bg-white/20" />
        <div className="flex items-center gap-1.5 text-white/60 text-sm">
          <Hash size={13} className="text-emerald-400" />
          <span>打順 {player.mostFrequentOrder}</span>
        </div>
      </div>
    </div>
  );
}
