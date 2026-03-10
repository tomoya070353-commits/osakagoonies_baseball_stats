"use client";

import type { PlayerStats } from "@/types";
import { MapPin, Hash } from "lucide-react";

interface PlayerHeaderProps {
  player: PlayerStats;
}

export default function PlayerHeader({ player }: PlayerHeaderProps) {
  return (
    <div className="relative px-5 pt-8 pb-6 overflow-hidden">
      {/* 背景グラデーション（ネイビー→透明） */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1e3a5f]/10 via-transparent to-transparent pointer-events-none" />

      {/* ゲーム数バッジ */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs mb-4 border border-[#1e3a5f]/20">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1e3a5f] animate-pulse" />
        {player.games.length} GAMES
      </div>

      {/* 選手名 */}
      <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
        {player.name}
      </h1>

      {/* 守備位置・打順 */}
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5 text-slate-500 text-sm">
          <MapPin size={13} className="text-[#1e3a5f]" />
          <span>{player.mostFrequentPosition}</span>
        </div>
        <div className="w-px h-3 bg-slate-300" />
        <div className="flex items-center gap-1.5 text-slate-500 text-sm">
          <Hash size={13} className="text-[#1e3a5f]" />
          <span>打順 {player.mostFrequentOrder}</span>
        </div>
      </div>
    </div>
  );
}
