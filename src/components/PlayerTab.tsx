"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PlayerStats } from "@/types";
import type { PitcherStats } from "@/app/actions";
import PlayerHeader from "@/components/PlayerHeader";
import QuickStats from "@/components/QuickStats";
import PlayerRadar from "@/components/PlayerRadar";
import DirectionChart from "@/components/DirectionChart";
import ContactChart from "@/components/ContactChart";
import ConditionBiorhythm from "@/components/ConditionBiorhythm";
import PitcherCard, { NoPitcherData } from "@/components/PitcherCard";
import NextGameMission from "@/components/NextGameMission";

interface PlayerTabProps {
  players: PlayerStats[];
  selected: PlayerStats;
  onSelect: (player: PlayerStats) => void;
  pitchers: PitcherStats[];
}

type Category = "batter" | "pitcher";

export default function PlayerTab({ players, selected, onSelect, pitchers }: PlayerTabProps) {
  const [category, setCategory] = useState<Category>("batter");

  // 選択中の選手の投手データ（名前一致）
  const pitcherData = pitchers.find((p) => p.name === selected.name) ?? null;

  return (
    <div className="flex flex-col gap-6 py-2 pb-8">
      {/* 選手名タップ → ドロップダウン */}
      <PlayerHeader
        player={selected}
        players={players}
        onSelect={(p) => {
          onSelect(p);
          setCategory("batter"); // 選手切り替え時は野手にリセット
        }}
      />

      {/* ── セグメントコントロール（野手 / 投手） ── */}
      <div className="px-5">
        <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => setCategory("batter")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${category === "batter"
              ? "bg-white shadow-sm text-[#1e3a5f]"
              : "text-slate-400 hover:text-slate-600"
              }`}
          >
            <span>⚾</span>
            <span>野手成績</span>
          </button>
          <button
            onClick={() => setCategory("pitcher")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${category === "pitcher"
              ? "bg-white shadow-sm text-[#1e3a5f]"
              : "text-slate-400 hover:text-slate-600"
              }`}
          >
            <span>🏟️</span>
            <span>投手成績</span>
          </button>
        </div>
      </div>

      {/* ── 成績表示エリア（アニメーション付き切り替え） ── */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selected.name}-${category}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* ── 野手成績 ── */}
            {category === "batter" && (
              <>
                <NextGameMission player={selected} />
                <QuickStats player={selected} />
                <div className="px-5 grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <PlayerRadar player={selected} />
                  <DirectionChart player={selected} />
                  <ContactChart player={selected} />
                </div>
                <div className="px-5">
                  <ConditionBiorhythm player={selected} />
                </div>
              </>
            )}

            {/* ── 投手成績 ── */}
            {category === "pitcher" && (
              pitcherData
                ? <PitcherCard pitcher={pitcherData} />
                : <NoPitcherData />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="h-4" />
    </div>
  );
}
