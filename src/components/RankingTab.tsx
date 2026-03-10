"use client";

import type { PlayerStats } from "@/types";
import { ChevronRight } from "lucide-react";

interface RankingTabProps {
  players: PlayerStats[];
  onDrillDown: (player: PlayerStats) => void;
}

const MEDALS = ["🥇", "🥈", "🥉"];
const MEDAL_BG = [
  "bg-amber-50 border-amber-200",
  "bg-slate-50 border-slate-200",
  "bg-orange-50 border-orange-200",
];
const MEDAL_num = [
  "text-amber-600",
  "text-slate-500",
  "text-orange-700",
];

interface RankingCategory {
  label: string;
  icon: string;
  getValue: (p: PlayerStats) => number;
  format: (v: number) => string;
  unit?: string;
}

const CATEGORIES: RankingCategory[] = [
  {
    label: "打率",
    icon: "🎯",
    getValue: (p) => p.avg,
    format: (v) => v.toFixed(3).replace(/^0/, ""),
  },
  {
    label: "本塁打",
    icon: "💣",
    getValue: (p) => p.homeRuns,
    format: (v) => `${v}`,
    unit: "本",
  },
  {
    label: "打点",
    icon: "🏆",
    getValue: (p) => p.rbi,
    format: (v) => `${v}`,
    unit: "打点",
  },
  {
    label: "OPS",
    icon: "📈",
    getValue: (p) => p.ops,
    format: (v) => v.toFixed(3).replace(/^0/, ""),
  },
  {
    label: "最多安打",
    icon: "🔥",
    getValue: (p) => p.hits,
    format: (v) => `${v}`,
    unit: "安打",
  },
  {
    label: "盗塁",
    icon: "💨",
    getValue: (p) => p.stolenBases,
    format: (v) => `${v}`,
    unit: "盗塁",
  },
  {
    label: "四死球",
    icon: "👁️",
    getValue: (p) => p.walks + p.hbp,
    format: (v) => `${v}`,
    unit: "BB+HBP",
  },
];

function RankingCard({
  category,
  players,
  onDrillDown,
}: {
  category: RankingCategory;
  players: PlayerStats[];
  onDrillDown: (player: PlayerStats) => void;
}) {
  const sorted = [...players]
    .sort((a, b) => category.getValue(b) - category.getValue(a))
    .slice(0, 3);

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
      {/* カードヘッダー */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
        <span className="text-lg">{category.icon}</span>
        <h3 className="text-sm font-bold text-slate-700">{category.label}</h3>
      </div>

      {/* ランキングリスト */}
      <div className="divide-y divide-slate-100">
        {sorted.map((player, i) => (
          <button
            key={player.name}
            onClick={() => onDrillDown(player)}
            className={`w-full flex items-center gap-3 px-4 py-3 active:bg-slate-50 transition-colors hover:bg-slate-50 ${
              i === 0 ? MEDAL_BG[0] : ""
            }`}
          >
            {/* 順位バッジ */}
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <span className="text-xl leading-none">{MEDALS[i]}</span>
            </div>

            {/* アバター */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              i === 0 ? "bg-amber-400 text-white" : "bg-slate-200 text-slate-600"
            }`}>
              {player.name.charAt(0)}
            </div>

            {/* 選手名 */}
            <div className="flex-1 text-left min-w-0">
              <p className={`font-semibold text-sm truncate ${MEDAL_num[i]}`}>
                {player.name}
              </p>
              <p className="text-slate-400 text-xs">{player.mostFrequentPosition}</p>
            </div>

            {/* 値 */}
            <div className="flex items-center gap-1 shrink-0">
              <span className={`font-black text-base ${i === 0 ? "text-amber-600" : "text-slate-700"}`}>
                {category.format(category.getValue(player))}
              </span>
              {category.unit && (
                <span className="text-slate-400 text-xs">{category.unit}</span>
              )}
              <ChevronRight size={14} className="text-slate-300 ml-1" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function RankingTab({ players, onDrillDown }: RankingTabProps) {
  return (
    <div className="flex flex-col gap-4 px-5 py-4 pb-8">
      {/* ヘッダー */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs mb-3 border border-[#1e3a5f]/20">
          <span>👑</span>
          <span>チームランキング</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">ランキング</h1>
        <p className="text-slate-400 text-sm mt-1">タップで個人詳細へジャンプ</p>
      </div>

      {/* 各カテゴリのランキングカード */}
      {CATEGORIES.map((cat) => (
        <RankingCard
          key={cat.label}
          category={cat}
          players={players}
          onDrillDown={onDrillDown}
        />
      ))}
    </div>
  );
}
