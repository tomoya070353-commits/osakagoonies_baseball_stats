"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { TeamSeasonStats, PitcherStats, TeamHistory, RecordHolder } from "@/app/actions";

interface MilestoneDashboardProps {
  teamStats: TeamSeasonStats | null;
  pitchers: PitcherStats[];
  teamHistory: TeamHistory;
}

// ── ティア計算 ──────────────────────────────────────────────
function getNextTarget(current: number, step: number) { return (Math.floor(current / step) + 1) * step; }
function getTier(current: number, step: number) { return Math.floor(current / step) + 1; }
function getPrev(current: number, step: number) { return Math.floor(current / step) * step; }
function getPct(current: number, step: number) { return Math.round(((current - getPrev(current, step)) / step) * 100); }
function isCleared(current: number, step: number) { return current > 0 && current % step === 0; }

// ── アニメーション設定 ────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};
function stagger(i: number) {
  return {
    variants: fadeUp,
    initial: "hidden",
    animate: "visible",
    transition: { duration: 0.4, ease: "easeOut", delay: i * 0.1 } as any
  };
}

// ── 通常プログレスバー ──────────────────────────────────────
function Bar({ pct, hot }: { pct: number; hot: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full transition-colors duration-700 ${pct >= 100 ? "bg-emerald-500" : hot ? "bg-[#dc2626]" : "bg-[#1e3a5f]"
          }`}
        initial={{ width: 0 }}
        animate={{ width: inView ? `${Math.min(pct, 100)}%` : 0 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
      />
    </div>
  );
}

// ── 通常マイルストーンカード ────────────────────────────────
function TierCard({ emoji, title, current, step, unit }: {
  emoji: string; title: string; current: number; step: number; unit: string;
}) {
  const target = getNextTarget(current, step);
  const prev = getPrev(current, step);
  const pct = getPct(current, step);
  const tier = getTier(current, step);
  const hot = pct >= 80;
  const cleared = isCleared(current, step);
  const remain = target - current;

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden shadow-sm ${hot ? "border-[#dc2626]/40" : "border-slate-200"}`}>
      <div className={`flex items-center justify-between px-5 pt-4 pb-3 ${cleared ? "bg-emerald-50" : hot ? "bg-red-50/40" : ""}`}>
        <div className="flex items-center gap-2">
          <span className={`text-xl ${cleared ? "animate-bounce" : ""}`}>{emoji}</span>
          <p className="font-bold text-slate-700 text-sm">{title}</p>
        </div>
        <span className={`text-[10px] font-black px-2 py-1 rounded-full ${cleared ? "bg-emerald-500 text-white animate-bounce"
          : hot ? "bg-red-100 text-[#dc2626] animate-pulse"
            : "bg-[#1e3a5f]/10 text-[#1e3a5f]"
          }`}>
          {cleared ? "✓ CLEARED!" : hot ? "🔥 王手！" : `Lv.${tier - 1} → Lv.${tier}`}
        </span>
      </div>
      {cleared && (
        <div className="mx-5 mb-2 bg-emerald-500 rounded-xl px-3 py-2 flex items-center gap-2">
          <span className="text-white text-base animate-bounce">🎉</span>
          <p className="text-white text-xs font-black">CLEARED! 次のステージへ！</p>
        </div>
      )}
      <div className="px-5 pb-1">
        <div className="flex items-end gap-1">
          <span className="text-slate-400 text-sm">あと</span>
          <span className={`text-3xl font-black leading-none ${cleared ? "text-emerald-500" : hot ? "text-[#dc2626]" : "text-[#1e3a5f]"}`}>{remain}</span>
          <span className={`text-base font-bold mb-0.5 ${cleared ? "text-emerald-500" : hot ? "text-[#dc2626]" : "text-[#1e3a5f]"}`}>{unit}</span>
          <span className="text-slate-400 text-xs mb-0.5 ml-1">で Lv.{tier} 達成</span>
        </div>
      </div>
      <div className="px-5 pb-4 mt-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-400 text-xs">{prev} → {current} / {target}{unit}</span>
          <span className={`text-xs font-bold ${hot || cleared ? "text-[#dc2626]" : "text-[#1e3a5f]"}`}>{pct}%</span>
        </div>
        <Bar pct={pct} hot={hot && !cleared} />
        <p className="text-slate-400 text-[10px] mt-1">Lv.{tier} 目標：{target}{unit}（ステップ {step}{unit}）</p>
      </div>
    </div>
  );
}

// ── ゴールドプログレスバー ─────────────────────────────────
function AnimatedHofBar({ pct, isNewRecord }: { pct: number; isNewRecord: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="w-full h-full">
      <motion.div
        className={`h-full rounded-full ${isNewRecord ? "animate-pulse" : ""}`}
        initial={{ width: 0 }}
        animate={{ width: inView ? `${Math.min(pct, 100)}%` : 0 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        style={{
          background: isNewRecord
            ? "linear-gradient(90deg, #f59e0b, #fde68a, #fffbeb)"
            : "linear-gradient(90deg, #92400e, #f59e0b, #fbbf24)",
          boxShadow: isNewRecord ? "0 0 16px rgba(251,191,36,0.8)" : "0 0 10px rgba(245,158,11,0.5)",
        }}
      />
    </div>
  );
}

// ── Hall of Fame カード ─────────────────────────────────────
function HofCard({ emoji, label, current, record, unit }: {
  emoji: string;
  label: string;
  current: number;
  record: RecordHolder;
  unit: string;
}) {
  const isNewRecord = current > record.value;
  const isTied = current === record.value && record.year !== "2026";
  const pct = record.value === 0 ? 100 : Math.min(Math.round((current / record.value) * 100), 999);
  const remain = Math.max(record.value - current + 1, 0); // +1 for "更新"

  return (
    <div className="rounded-2xl overflow-hidden border-2 border-amber-400/50 shadow-xl">
      {/* ── ダークヘッダー ── */}
      <div className="bg-gradient-to-br from-[#0a0f1e] via-[#1a1a2e] to-[#0d1117] px-5 pt-5 pb-4 relative overflow-hidden">
        {/* 装飾ライン */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
        </div>

        {/* バッジ行 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 text-[9px] font-black tracking-[0.3em] uppercase">Hall of Fame</span>
          </div>
          {isNewRecord && (
            <span className="text-[10px] font-black bg-amber-400 text-amber-900 px-2.5 py-1 rounded-full animate-pulse">
              🏆 ALL-TIME RECORD!!
            </span>
          )}
          {isTied && (
            <span className="text-[10px] font-black bg-emerald-400 text-emerald-900 px-2.5 py-1 rounded-full animate-bounce">
              🤝 タイ記録！！
            </span>
          )}
        </div>

        {/* 項目名 */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{emoji}</span>
          <p className="text-white font-black text-sm">{label}</p>
        </div>

        {/* 歴代記録 */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-white/40 text-[10px] mb-0.5">歴代最高記録</p>
            <div className="flex items-end gap-1">
              <span className="text-amber-400 text-3xl font-black leading-none">{record.value}</span>
              <span className="text-amber-400/70 text-base font-bold pb-0.5">{unit}</span>
            </div>
            <p className="text-white/30 text-[10px] mt-0.5">{record.year}年シーズン</p>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-[10px] mb-0.5">2026年 現在</p>
            <span className={`text-3xl font-black leading-none ${isNewRecord ? "text-amber-400 animate-pulse" : "text-white"}`}>
              {current}
            </span>
            <p className="text-white/30 text-[10px] mt-0.5">{unit}</p>
          </div>
        </div>

        {/* 金色プログレスバー */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/30 text-[10px]">
              {isNewRecord ? "記録更新中！" : `あと ${remain} ${unit} で更新`}
            </span>
            <span className="text-amber-400 text-[10px] font-bold">{pct}%</span>
          </div>
          <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
            <AnimatedHofBar pct={pct} isNewRecord={isNewRecord} />
          </div>
        </div>

        {/* 記録更新時の特別メッセージ */}
        {isNewRecord && (
          <div className="mt-3 bg-amber-400/20 border border-amber-400/40 rounded-xl px-3 py-2 text-center">
            <p className="text-amber-300 text-xs font-black animate-pulse">
              🎊 ALL-TIME RECORD UPDATED!! 🎊
            </p>
            <p className="text-amber-400/70 text-[10px] mt-0.5">歴代記録を塗り替えた！！</p>
          </div>
        )}
      </div>

      {/* ゴールドフッター */}
      <div className="bg-gradient-to-r from-amber-900/20 via-amber-400/10 to-amber-900/20 border-t border-amber-400/30 px-5 py-2 flex items-center justify-between">
        <span className="text-amber-700/70 text-[9px] font-semibold uppercase tracking-widest">Legendary Record</span>
        <span className="text-amber-600 text-[10px] font-bold">歴代最高：{record.value}{unit}（{record.year}年）</span>
      </div>
    </div>
  );
}

// ── 年末カウントダウン ────────────────────────────────────────
function YearEndBanner() {
  const days = Math.ceil((new Date(new Date().getFullYear(), 11, 31).getTime() - new Date().getTime()) / 86400000);
  return (
    <div className="bg-[#1e3a5f] rounded-2xl px-5 py-4 flex items-center justify-between">
      <div>
        <p className="text-white/60 text-[10px] font-semibold uppercase tracking-wider">Season Countdown</p>
        <p className="text-white text-sm font-bold mt-0.5">2026年12月31日まで</p>
      </div>
      <div className="text-right">
        <p className="text-white text-4xl font-black leading-none">{days}</p>
        <p className="text-white/60 text-xs">残り日数</p>
      </div>
    </div>
  );
}

// ── メイン ──────────────────────────────────────────────────
export default function MilestoneDashboard({ teamStats, pitchers, teamHistory }: MilestoneDashboardProps) {
  if (!teamStats) return <div className="px-5 py-8 text-center text-slate-400 text-sm">2026年度のデータがありません</div>;

  const totalKs = pitchers.reduce((s, p) => s + p.strikeouts, 0);
  const { recordHolders } = teamHistory;

  return (
    <div className="flex flex-col gap-5 px-5 py-4 pb-8">
      {/* ヘッダー */}
      <motion.div {...stagger(0)}>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs mb-3 border border-[#1e3a5f]/20">
          <span>🏆</span><span>チームマイルストーン</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">記録への道</h1>
        <p className="text-slate-400 text-sm mt-1">2026年シーズン目標達成状況</p>
      </motion.div>

      {/* 年末カウントダウン */}
      <motion.div {...stagger(1)}>
        <YearEndBanner />
      </motion.div>

      {/* ── 🎯 シーズン目標（Step-up Goals） ── */}
      <section>
        <motion.div className="flex items-center gap-2 mb-3" {...stagger(2)}>
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">🎯 シーズン目標 — Step-up Goals</span>
          <div className="h-px flex-1 bg-slate-200" />
        </motion.div>
        <div className="flex flex-col gap-3">
          <motion.div {...stagger(3)}><TierCard emoji="🏆" title="シーズン勝利数" current={teamStats.wins} step={10} unit="勝" /></motion.div>
          <motion.div {...stagger(4)}><TierCard emoji="🔥" title="チーム総得点" current={teamStats.runs} step={50} unit="点" /></motion.div>
          <motion.div {...stagger(5)}><TierCard emoji="💣" title="チーム本塁打" current={teamStats.homeRuns} step={10} unit="本" /></motion.div>
          <motion.div {...stagger(6)}><TierCard emoji="⚡" title="投手陣・奪三振" current={totalKs} step={50} unit="K" /></motion.div>
          <motion.div {...stagger(7)}><TierCard emoji="💨" title="チーム総盗塁" current={teamStats.stolenBases} step={30} unit="盗塁" /></motion.div>
        </div>
      </section>

      {/* ── 🏆 歴代最高記録への挑戦（Legendary Records） ── */}
      <section>
        <motion.div className="flex items-center gap-2 mb-3" {...stagger(8)}>
          <div className="h-px flex-1 bg-amber-300" />
          <span className="text-amber-600 text-[10px] font-black uppercase tracking-widest">🏆 Legendary Records</span>
          <div className="h-px flex-1 bg-amber-300" />
        </motion.div>
        <div className="flex flex-col gap-4">
          <motion.div {...stagger(9)}><HofCard emoji="🏆" label="歴代最高勝利数" current={teamStats.wins} record={recordHolders.wins} unit="勝" /></motion.div>
          <motion.div {...stagger(10)}><HofCard emoji="🔥" label="歴代最高得点数" current={teamStats.runs} record={recordHolders.runs} unit="点" /></motion.div>
          <motion.div {...stagger(11)}><HofCard emoji="💣" label="歴代最高本塁打数" current={teamStats.homeRuns} record={recordHolders.homeRuns} unit="本" /></motion.div>
          <motion.div {...stagger(12)}><HofCard emoji="💨" label="歴代最高盗塁数" current={teamStats.stolenBases} record={recordHolders.stolenBases} unit="盗塁" /></motion.div>
        </div>
      </section>
    </div>
  );
}

