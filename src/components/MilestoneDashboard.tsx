"use client";

import type { TeamSeasonStats, PitcherStats } from "@/app/actions";

interface MilestoneDashboardProps {
  teamStats: TeamSeasonStats | null;
  pitchers: PitcherStats[];
}

// ── ティア計算ロジック ─────────────────────────────────────────
/**
 * 現在値に基づいて「次のキリの良い目標値」を返す。
 * 例: current=9, step=10 → 10 / current=10 → 20 / current=23 → 30
 */
function getNextTarget(current: number, step: number): number {
  const tier = Math.floor(current / step);
  return (tier + 1) * step;
}
function getTier(current: number, step: number): number {
  return Math.floor(current / step) + 1; // 次の目標が何周目か
}
function getPrevTarget(current: number, step: number): number {
  return Math.floor(current / step) * step;
}
function getProgress(current: number, step: number): number {
  const prev = getPrevTarget(current, step);
  return Math.round(((current - prev) / step) * 100);
}
// currentが目標をちょうど達成したか（前のターゲットに一致）
function isJustCleared(current: number, step: number): boolean {
  return current > 0 && current % step === 0;
}

// ── プログレスバー ─────────────────────────────────────────────
function ProgressBar({ pct, hot }: { pct: number; hot: boolean }) {
  return (
    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${
          pct >= 100
            ? "bg-emerald-500"
            : hot
            ? "bg-[#dc2626] animate-pulse"
            : "bg-[#1e3a5f]"
        }`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

// ── マイルストーンカード ──────────────────────────────────────
function MilestoneCard({
  emoji,
  title,
  current,
  step,
  unit,
}: {
  emoji: string;
  title: string;
  current: number;
  step: number;
  unit: string;
}) {
  const target   = getNextTarget(current, step);
  const prev     = getPrevTarget(current, step);
  const pct      = getProgress(current, step);
  const tier     = getTier(current, step);
  const hot      = pct >= 80;
  const cleared  = isJustCleared(current, step);
  const remain   = target - current;

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden shadow-sm ${hot ? "border-[#dc2626]/40" : "border-slate-200"}`}>
      {/* ヘッダー */}
      <div className={`flex items-center justify-between px-5 pt-5 pb-3 ${hot && !cleared ? "bg-red-50/50" : ""} ${cleared ? "bg-emerald-50" : ""}`}>
        <div className="flex items-center gap-2">
          <span className={`text-2xl ${cleared ? "animate-bounce" : ""}`}>{emoji}</span>
          <p className="font-bold text-slate-700 text-sm leading-tight">{title}</p>
        </div>
        <span
          className={`text-[10px] font-black px-2 py-1 rounded-full ${
            cleared
              ? "bg-emerald-500 text-white animate-bounce"
              : hot
              ? "bg-red-100 text-[#dc2626] animate-pulse"
              : "bg-[#1e3a5f]/10 text-[#1e3a5f]"
          }`}
        >
          {cleared ? "✓ CLEARED!" : hot ? "🔥 王手！" : `Lv.${tier - 1} → Lv.${tier}`}
        </span>
      </div>

      {/* CLEARED演出 */}
      {cleared && (
        <div className="mx-5 mb-3 bg-emerald-500 rounded-xl px-4 py-2 flex items-center gap-2">
          <span className="text-white text-lg animate-bounce">🎉</span>
          <div>
            <p className="text-white text-xs font-black">CLEARED! 次のステージへ！</p>
            <p className="text-white/70 text-[10px]">目標 {target - step}{unit} を達成！次は {target}{unit} に挑戦。</p>
          </div>
        </div>
      )}

      {/* 大数字「あと○○」 */}
      <div className="px-5 pb-2">
        <div className="flex items-end gap-1.5">
          <span className="text-slate-400 text-sm font-semibold">あと</span>
          <span className={`text-4xl font-black leading-none ${cleared ? "text-emerald-500" : hot ? "text-[#dc2626]" : "text-[#1e3a5f]"}`}>
            {remain.toLocaleString()}
          </span>
          <span className={`text-lg font-bold mb-0.5 ${cleared ? "text-emerald-500" : hot ? "text-[#dc2626]" : "text-[#1e3a5f]"}`}>{unit}</span>
          <span className="text-slate-400 text-xs mb-0.5 ml-1">で Lv.{tier} 達成</span>
        </div>
      </div>

      {/* プログレスバー */}
      <div className="px-5 pb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-slate-400 text-xs">{prev.toLocaleString()} → {current.toLocaleString()} / {target.toLocaleString()}{unit}</span>
          <span className={`text-xs font-bold ${hot || cleared ? "text-[#dc2626]" : "text-[#1e3a5f]"}`}>{pct}%</span>
        </div>
        <ProgressBar pct={pct} hot={hot && !cleared} />
        <p className="text-slate-400 text-[10px] mt-1.5">
          現在の目標：{target.toLocaleString()}{unit}（Lv.{tier} / ステップ幅 {step.toLocaleString()}{unit}）
        </p>
      </div>
    </div>
  );
}

// ── 年末カウントダウン ────────────────────────────────────────
function YearEndBanner() {
  const now     = new Date();
  const yearEnd = new Date(now.getFullYear(), 11, 31);
  const days    = Math.ceil((yearEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

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
export default function MilestoneDashboard({ teamStats, pitchers }: MilestoneDashboardProps) {
  if (!teamStats) {
    return (
      <div className="px-5 py-8 text-center text-slate-400 text-sm">
        2026年度のデータがありません
      </div>
    );
  }

  // 投手合計奪三振
  const totalKs = pitchers.reduce((s, p) => s + p.strikeouts, 0);

  return (
    <div className="flex flex-col gap-5 px-5 py-4 pb-8">
      {/* ヘッダー */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs mb-3 border border-[#1e3a5f]/20">
          <span>🏆</span><span>チームマイルストーン</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">記録への道</h1>
        <p className="text-slate-400 text-sm mt-1">2026年シーズン目標達成状況（エンドレスティア）</p>
      </div>

      {/* 年末カウントダウン */}
      <YearEndBanner />

      {/* マイルストーンカード */}
      <MilestoneCard emoji="🏆" title="シーズン勝利数"       current={teamStats.wins}        step={10}  unit="勝" />
      <MilestoneCard emoji="🔥" title="チーム総得点"         current={teamStats.runs}        step={50}  unit="点" />
      <MilestoneCard emoji="💣" title="チーム本塁打"         current={teamStats.homeRuns}    step={10}  unit="本" />
      <MilestoneCard emoji="⚡" title="投手陣・奪三振"       current={totalKs}               step={50}  unit="K" />
      <MilestoneCard emoji="💨" title="チーム総盗塁"         current={teamStats.stolenBases} step={30}  unit="盗塁" />
    </div>
  );
}
