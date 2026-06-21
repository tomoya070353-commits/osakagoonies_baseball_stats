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
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" as const }}
    >
      {/* 背景グラデーション */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1e3a5f]/8 via-[#319795]/3 to-transparent pointer-events-none" />

      {/* ゲーム数バッジ */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#1e3a5f]/10 to-[#319795]/10 text-[#1e3a5f] text-xs font-bold mb-4 shadow-sm border border-white/50">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
        {player.games.length} GAMES
      </div>

      {/* 選手名（タップでドロップダウン） */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex items-center gap-2 group"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#1e3a5f] via-[#2c5282] to-[#319795] tracking-tight leading-none transition-all duration-300 group-hover:opacity-90">
          {player.name}
        </h1>
        <ChevronDown
          size={20}
          className="text-[#1e3a5f]/80 mt-1 transition-transform duration-300 ease-out group-hover:text-[#1e3a5f] group-active:scale-95"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* 守備位置・打順 */}
      <div className="flex items-center gap-2.5 mt-3.5">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/80 border border-slate-200/50 text-slate-600 text-xs font-semibold shadow-sm">
          <MapPin size={12} className="text-[#319795]" />
          <span>{player.mostFrequentPosition}</span>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/80 border border-slate-200/50 text-slate-600 text-xs font-semibold shadow-sm">
          <Hash size={12} className="text-[#1e3a5f]" />
          <span>打順 {player.mostFrequentOrder}</span>
        </div>
      </div>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          role="listbox"
          className="absolute left-5 top-full mt-2.5 z-50 w-[calc(100%-2.5rem)] max-w-sm bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_rgba(30,58,95,0.12)] border border-slate-100/80 overflow-hidden"
        >
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-50 p-2 scrollbar-thin">
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
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-left transition-all duration-200 ${isSelected
                      ? "bg-gradient-to-r from-[#1e3a5f]/5 to-[#319795]/5 text-[#1e3a5f]"
                      : "hover:bg-slate-50 text-slate-700 hover:translate-x-0.5"
                    } active:bg-slate-100`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-transform ${isSelected ? "bg-gradient-to-br from-[#1e3a5f] to-[#319795] text-white shadow-sm" : "bg-slate-100 text-slate-500"
                      }`}>
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800">{p.name}</p>
                      <p className="text-slate-400 text-[11px] font-medium">{p.mostFrequentPosition} | {p.games.length}試合</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-slate-500 text-xs font-bold font-mono bg-slate-100/80 px-2 py-1 rounded-md border border-slate-200/30">
                      {p.avg.toFixed(3).replace(/^0/, ".")}
                    </span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white">
                        <Check size={11} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
