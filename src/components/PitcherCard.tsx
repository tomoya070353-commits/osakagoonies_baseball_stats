"use client";

import type { PitcherStats } from "@/app/actions";
import { motion } from "framer-motion";

// 小グリッドのセル（accentなし統一、ゲージアニメーション付き）
function StatCell({ label, value, pct = 0 }: { label: string; value: string; pct?: number }) {
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } }
  };

  return (
    <motion.div
      variants={itemVariants}
      className="relative flex flex-col items-center p-3 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden"
    >
      {/* 背景ゲージ（Staggered Bar Fill） */}
      {pct > 0 && (
        <motion.div
          className="absolute inset-x-0 bottom-0 bg-slate-200/50 origin-bottom z-0"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: pct / 100 }}
          transition={{ duration: 0.8, ease: "easeOut" as const }}
          viewport={{ once: true }}
          style={{ height: "100%" }}
        />
      )}

      {/* 前面コンテンツ */}
      <span className="relative z-10 text-[10px] font-semibold uppercase tracking-wider mb-0.5 text-slate-400">
        {label}
      </span>
      <span className="relative z-10 text-xl font-black leading-none text-[#1e3a5f]">
        {value}
      </span>
    </motion.div>
  );
}

export default function PitcherCard({ pitcher }: { pitcher: PitcherStats }) {
  const winRateStr =
    pitcher.winRate === 0 && pitcher.wins === 0 && pitcher.losses === 0
      ? "—"
      : pitcher.winRate.toFixed(3).replace(/^0/, "");

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 } }
  };

  return (
    <div className="px-5 flex flex-col gap-4">

      {/* ── ヘッダー行 ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center text-xl">
          🏟️
        </div>
        <div>
          <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Pitching Stats</p>
          <p className="text-slate-700 text-sm font-bold">{pitcher.games}試合登板</p>
        </div>
      </div>

      {/* ── ブロック1: 防御率（ERA）のみ ── */}
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ duration: 0.2 }}
        className="bg-gradient-to-r from-[#1e3a5f] to-[#2a5298] rounded-2xl p-5 shadow-sm"
      >
        <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">
          防御率 ERA
        </p>
        <p className="text-white text-6xl font-black leading-none">
          {pitcher.era.toFixed(2)}
        </p>
      </motion.div>

      {/* ── ブロック2: 試合数・投球回・勝敗・勝率 ── */}
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ duration: 0.2 }}
        className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4"
      >
        <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-3">
          勝敗・投球
        </p>
        <motion.div className="grid grid-cols-3 gap-2 mb-2" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
          <StatCell label="試合数" value={`${pitcher.games}`} pct={Math.min((pitcher.games / 30) * 100, 100)} />
          <StatCell label="投球回" value={pitcher.innings} pct={Math.min((parseFloat(pitcher.innings) / 100) * 100, 100)} />
          <StatCell label="勝率" value={winRateStr} pct={pitcher.winRate * 100} />
        </motion.div>
        <motion.div className="grid grid-cols-3 gap-2" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
          <StatCell label="勝" value={`${pitcher.wins}`} pct={Math.min((pitcher.wins / 15) * 100, 100)} />
          <StatCell label="敗" value={`${pitcher.losses}`} pct={Math.min((pitcher.losses / 15) * 100, 100)} />
          <StatCell label="セーブ" value={`${pitcher.saves}`} pct={Math.min((pitcher.saves / 10) * 100, 100)} />
        </motion.div>
      </motion.div>

      {/* ── ブロック3: 投球詳細 ── */}
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ duration: 0.2 }}
        className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4"
      >
        <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-3">
          投球詳細
        </p>
        <motion.div className="grid grid-cols-3 gap-2" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
          <StatCell label="奪三振" value={`${pitcher.strikeouts}`} pct={Math.min((pitcher.strikeouts / 100) * 100, 100)} />
          <StatCell label="与四死球" value={`${pitcher.walksHBP}`} pct={Math.min((pitcher.walksHBP / 50) * 100, 100)} />
          <StatCell label="被安打" value={`${pitcher.hitsAllowed}`} pct={Math.min((pitcher.hitsAllowed / 100) * 100, 100)} />
          <StatCell label="完投" value={`${pitcher.completeGames}`} pct={Math.min((pitcher.completeGames / 5) * 100, 100)} />
          <StatCell label="完封" value={`${pitcher.shutouts}`} pct={Math.min((pitcher.shutouts / 3) * 100, 100)} />
          <StatCell label="失点" value={`${pitcher.runsAllowed}`} pct={Math.min((pitcher.runsAllowed / 60) * 100, 100)} />
        </motion.div>
      </motion.div>

    </div>
  );
}

// 投手データがない場合の表示
export function NoPitcherData() {
  return (
    <div className="px-5">
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
        <span className="text-4xl">🏟️</span>
        <p className="text-slate-500 font-semibold">投手データなし</p>
        <p className="text-slate-400 text-sm">この選手の投手成績は記録されていません</p>
      </div>
    </div>
  );
}
