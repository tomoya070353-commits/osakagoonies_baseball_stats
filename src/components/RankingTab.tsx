"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { PlayerStats } from "@/types";
import { ChevronRight } from "lucide-react";

// 連続記録（ストリーク）の炎アイコン表示
function StreakIndicator({ player }: { player: PlayerStats }) {
  if (player.hittingStreak > 1 || player.onBaseStreak > 1) {
    const title = player.hittingStreak > 1 
      ? `${player.hittingStreak}試合連続安打` 
      : `${player.onBaseStreak}試合連続出塁`;
    return (
      <motion.span 
        className="ml-1 text-[11px] inline-block" 
        title={title}
        animate={{ rotate: [-5, 5, -5], scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 0.6 }}
      >
        🔥
      </motion.span>
    );
  }
  return null;
}

interface RankingTabProps {
  players: PlayerStats[];
  onDrillDown: (player: PlayerStats) => void;
}

const MEDALS = ["🥇", "🥈", "🥉", "4", "5"];
const MEDAL_BG = [
  "bg-amber-50 border border-amber-200 shadow-md z-10",
  "bg-slate-50 border border-slate-200 z-0",
  "bg-orange-50 border border-orange-200 z-0",
  "bg-white border-b border-slate-100 z-0",
  "bg-white border-b border-slate-100 z-0",
];
const MEDAL_num = [
  "text-amber-700",
  "text-slate-600",
  "text-orange-800",
  "text-slate-500",
  "text-slate-500",
];
const GAUGE_COLORS = [
  "bg-amber-400/20",   // 1位
  "bg-slate-300/30",   // 2位
  "bg-orange-300/20",  // 3位
  "bg-slate-200/40",   // 4位
  "bg-slate-200/40",   // 5位
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

// ── ゲージの相対幅計算用コンポーネント ──
function StatGauge({
  val,
  maxVal,
  rankIndex,
}: {
  val: number;
  maxVal: number;
  rankIndex: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const pct = maxVal > 0 ? Math.min((val / maxVal) * 100, 100) : 0;

  return (
    <div ref={ref} className="absolute inset-0 pointer-events-none select-none z-0">
      <motion.div
        className={`h-full ${GAUGE_COLORS[rankIndex]}`}
        initial={{ width: 0 }}
        animate={{ width: inView ? `${pct}%` : 0 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: rankIndex === 0 ? 0.8 : 0.2 }}
      />
    </div>
  );
}

// ── 各ランキングカード ──
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
    .filter((p) => !p.name.includes("助っ人"))
    .sort((a, b) => category.getValue(b) - category.getValue(a))
    .slice(0, 5); // 5人表示

  const maxVal = sorted.length > 0 ? category.getValue(sorted[0]) : 0;

  // Stagger コンテナ（1位が最後にバウンドするための遅延等も設定可能）
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
        // 1位以外の表示から先に始めるため、staggerを工夫するか各アイテムで明示指定する。
        // ここではアイテム側でカスタムDelayを設定しやすくする
      }
    }
  };

  // 1位のドラマチックアニメーション（Spring バウンド）
  const firstPlaceVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: ("spring" as any),
        stiffness: 300,
        damping: 15,
        delay: 0.6, // 他が出揃った後に「ドンッ！」
      }
    }
  };

  // 4位以下の控えめなアニメーション
  const normalVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const }
    }
  };

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden mb-5">
      {/* カードヘッダー */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50 relative z-20">
        <span className="text-lg">{category.icon}</span>
        <h3 className="text-sm font-bold text-slate-700">{category.label}</h3>
      </div>

      {/* ランキングリスト */}
      <motion.div
        className="flex flex-col relative bg-white pb-1"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {sorted.map((player, i) => {
          const isFirstItem = i === 0;
          return (
            <motion.div
              key={player.name}
              variants={isFirstItem ? firstPlaceVariants : normalVariants}
              className="relative"
              style={{ zIndex: isFirstItem ? 10 : 5 - i }} // 1位を最前面に
            >
              {/* 王冠ドロップエフェクト（1位限定） */}
              {isFirstItem && (
                <motion.div
                  className="absolute -top-3 -left-1 text-2xl z-30 drop-shadow-md pointer-events-none"
                  initial={{ opacity: 0, y: -20, rotate: -20, scale: 0.5 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10, delay: 1.0 }}
                  viewport={{ once: true }}
                >
                  👑
                </motion.div>
              )}

              {/* 選手行ボタン */}
              <button
                onClick={() => onDrillDown(player)}
                className={`w-full relative flex items-center gap-3 px-4 py-3 transition-colors hover:bg-black/5 active:bg-black/10 overflow-hidden ${isFirstItem ? "mt-1 mb-1 mx-2 w-[calc(100%-16px)] rounded-xl" : ""
                  } ${MEDAL_BG[i]}`}
              >
                {/* 背景スタッツゲージ */}
                <StatGauge val={category.getValue(player)} maxVal={maxVal} rankIndex={i} />

                {/* 順位バッジ */}
                <div className="w-8 h-8 flex items-center justify-center shrink-0 relative z-10">
                  <span className={`leading-none font-bold ${i < 3 ? "text-xl" : "text-sm text-slate-400"}`}>
                    {MEDALS[i]}
                  </span>
                </div>

                {/* アバター */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm relative z-10 ${i === 0 ? "bg-amber-400 text-amber-900 border border-amber-500" :
                  i === 1 ? "bg-slate-200 text-slate-600 border border-slate-300" :
                    i === 2 ? "bg-orange-200 text-orange-800 border border-orange-300" :
                      "bg-slate-100 text-slate-400"
                  }`}>
                  {player.name.charAt(0)}
                </div>

                {/* 選手名 */}
                <div className="flex-1 text-left min-w-0 relative z-10 flex flex-col justify-center">
                  <div className="flex items-center">
                    <p className={`font-semibold text-sm truncate ${MEDAL_num[i]}`}>
                      {player.name}
                    </p>
                    <StreakIndicator player={player} />
                  </div>
                  <p className="text-slate-400/80 text-[10px] uppercase font-bold tracking-wider">{player.mostFrequentPosition}</p>
                </div>

                {/* 値 */}
                <div className="flex items-center gap-1 shrink-0 relative z-10">
                  <span className={`font-black tracking-tight ${isFirstItem ? "text-xl text-amber-600 drop-shadow-sm" : "text-base text-slate-700"
                    }`}>
                    {category.format(category.getValue(player))}
                  </span>
                  {category.unit && (
                    <span className={`text-[10px] mt-1 ${isFirstItem ? "text-amber-600/70 font-bold" : "text-slate-400"}`}>
                      {category.unit}
                    </span>
                  )}
                  <ChevronRight size={14} className="text-slate-300 ml-1" />
                </div>
              </button>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

export default function RankingTab({ players, onDrillDown }: RankingTabProps) {
  // ページ自体のフェードイン
  const pageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const }
    }
  };

  return (
    <motion.div
      className="flex flex-col gap-2 px-5 py-4 pb-8"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ヘッダー */}
      <div className="mb-2">
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
    </motion.div>
  );
}
