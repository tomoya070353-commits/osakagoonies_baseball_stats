"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import type { PlayerStats } from "@/types";
import { MapPin, Hash, ChevronDown, Check } from "lucide-react";

interface PlayerHeaderProps {
  player: PlayerStats;
  players: PlayerStats[];
  onSelect: (player: PlayerStats) => void;
}

export default function PlayerHeader({ player, players, onSelect }: PlayerHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 外側タップで閉じる
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <motion.div
      className="relative px-5 pt-8 pb-6 overflow-visible"
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" as const }}
    >
      {/* 背景グラデーション */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1e3a5f]/10 via-transparent to-transparent pointer-events-none" />

      {/* ゲーム数バッジ */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs mb-4 border border-[#1e3a5f]/20">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1e3a5f] animate-pulse" />
        {player.games.length} GAMES
      </div>

      {/* 選手名（タップでドロップダウン） */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex items-center gap-2 group"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none group-active:text-[#1e3a5f] transition-colors">
          {player.name}
        </h1>
        <ChevronDown
          size={22}
          className={`text-[#1e3a5f] mt-1 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

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

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-5 top-full mt-1 z-50 w-[calc(100%-2.5rem)] max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
        >
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
            {players.map((p) => {
              const isSelected = p.name === player.name;
              return (
                <button
                  key={p.name}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onSelect(p);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${isSelected
                      ? "bg-[#1e3a5f]/5 text-[#1e3a5f]"
                      : "hover:bg-slate-50 text-slate-700"
                    } active:bg-slate-100`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isSelected ? "bg-[#1e3a5f] text-white" : "bg-slate-100 text-slate-500"
                      }`}>
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{p.name}</p>
                      <p className="text-slate-400 text-xs">{p.mostFrequentPosition} | {p.games.length}試合</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-slate-400 text-sm font-mono">
                      {p.avg.toFixed(3).replace(/^0/, "")}
                    </span>
                    {isSelected && <Check size={16} className="text-[#1e3a5f]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
