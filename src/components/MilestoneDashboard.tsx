"use client";

import type { TeamSeasonStats, PitcherStats, TeamHistory } from "@/app/actions";

interface MilestoneDashboardProps {
  teamStats: TeamSeasonStats | null;
  pitchers: PitcherStats[];
  teamHistory: TeamHistory;
}

// ── ティア計算ロジック ─────────────────────────────────────────
function getNextTarget(current: number, step: number): number {
  const tier = Math.floor(current / step);
  return (tier + 1) * step;
}
function getTier(current: number, step: number): number {
  return Math.floor(current / step) + 1;
}
function getPrevTarget(current: number, step: number): number {
  return Math.floor(current / step) * step;
}
function getProgress(current: number, step: number): number {
  const prev = getPrevTarget(current, step);
  return Math.round(((current - prev) / step) * 100);
}
function isJustCleared(current: number, step: number): boolean {
  return current > 0 && current % step === 0;
}

// ── 通常プログレスバー ─────────────────────────────────────────
function ProgressBar({ pct, hot }: { pct: number; hot: boolean }) {
  return (
    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${
          pct >= 100 ? "bg-emerald-500" : hot ? "bg-[#dc2626] animate-pulse" : "bg-[#1e3a5f]"
        }`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

// ── 通常マイルストーンカード ──────────────────────────────────
function MilestoneCard({ emoji, title, current, step, unit }: {
  emoji: string; title: string; current: number; step: number; unit: string;
}) {
  const target  = getNextTarget(current, step);
  const prev    = getPrevTarget(current, step);
  const pct     = getProgress(current, step);
  const tier    = getTier(current, step);
  const hot     = pct >= 80;
  const cleared = isJustCleared(current, step);
  const remain  = target - current;

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden shadow-sm ${hot ? "border-[#dc2626]/40" : "border-slate-200"}`}>
      <div className={`flex items-center justify-between px-5 pt-5 pb-3 ${cleared ? "bg-emerald-50" : hot ? "bg-red-50/50" : ""}`}>
        <div className="flex items-center gap-2">
          <span className={`text-2xl ${cleared ? "animate-bounce" : ""}`}>{emoji}</span>
          <p className="font-bold text-slate-700 text-sm">{title}</p>
        </div>
        <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
          cleared ? "bg-emerald-500 text-white animate-bounce"
          : hot ? "bg-red-100 text-[#dc2626] animate-pulse"
          : "bg-[#1e3a5f]/10 text-[#1e3a5f]"
        }`}>
          {cleared ? "✓ CLEARED!" : hot ? "🔥 王手！" : `Lv.${tier - 1} → Lv.${tier}`}
        </span>
      </div>
      {cleared && (
        <div className="mx-5 mb-3 bg-emerald-500 rounded-xl px-4 py-2 flex items-center gap-2">
          <span className="text-white text-lg animate-bounce">🎉</span>
          <p className="text-white text-xs font-black">CLEARED! 次のステージへ！</p>
        </div>
      )}
      <div className="px-5 pb-2">
        <div className="flex items-end gap-1.5">
          <span className="text-slate-400 text-sm">あと</span>
          <span className={`text-4xl font-black leading-none ${cleared ? "text-emerald-500" : hot ? "text-[#dc2626]" : "text-[#1e3a5f]"}`}>{remain}</span>
          <span className={`text-lg font-bold mb-0.5 ${cleared ? "text-emerald-500" : hot ? "text-[#dc2626]" : "text-[#1e3a5f]"}`}>{unit}</span>
          <span className="text-slate-400 text-xs mb-0.5 ml-1">で Lv.{tier} 達成</span>
        </div>
      </div>
      <div className="px-5 pb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-slate-400 text-xs">{prev} → {current} / {target}{unit}</span>
          <span className={`text-xs font-bold ${hot || cleared ? "text-[#dc2626]" : "text-[#1e3a5f]"}`}>{pct}%</span>
        </div>
        <ProgressBar pct={pct} hot={hot && !cleared} />
        <p className="text-slate-400 text-[10px] mt-1.5">現在の目標：{target}{unit}（Lv.{tier} / ステップ幅 {step}{unit}）</p>
      </div>
    </div>
  );
}

// ── レジェンドカード（特別枠） ────────────────────────────────
function LegendCard({ emoji, badgeLabel, title, note, current, target, unit, isNewRecord }: {
  emoji: string;
  badgeLabel: string;
  title: string;
  note: string;
  current: number;
  target: number;
  unit: string;
  isNewRecord: boolean;
}) {
  const remain = Math.max(target - current, 0);
  const pct    = target === 0 ? 100 : Math.min(Math.round((current / target) * 100), 100);
  const done   = current >= target;

  return (
    <div className="rounded-2xl overflow-hidden border-2 border-amber-400/60 shadow-lg">
      {/* ゴールド×ダークグラデーション */}
      <div className="bg-gradient-to-br from-slate-900 via-[#1a1a2e] to-slate-900 px-5 pt-5 pb-4">
        {/* バッジ */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-amber-400 text-[10px] font-black tracking-[0.25em] uppercase">{badgeLabel}</span>
          {isNewRecord && (
            <span className="text-xs font-black text-amber-900 bg-amber-400 px-2.5 py-1 rounded-full animate-pulse">
              👑 NEW RECORD!!
            </span>
          )}
          {done && !isNewRecord && (
            <span className="text-xs font-black text-emerald-900 bg-emerald-400 px-2.5 py-1 rounded-full animate-bounce">🎉 達成！</span>
          )}
        </div>

        {/* タイトル */}
        <p className="text-white font-black text-base leading-tight mb-1">{title}</p>
        <p className="text-white/40 text-[10px] mb-4">{note}</p>

        {/* 数値 */}
        {isNewRecord ? (
          <div className="flex items-end gap-2">
            <span className="text-amber-400 text-5xl font-black leading-none animate-pulse">{current}</span>
            <div className="pb-1">
              <p className="text-amber-400 font-black text-base">{unit}</p>
              <p className="text-white/40 text-[10px]">記録更新中！（旧記録 {target}{unit}）</p>
            </div>
          </div>
        ) : done ? (
          <p className="text-emerald-400 text-4xl font-black">目標達成🎉</p>
        ) : (
          <div className="flex items-end gap-1.5">
            <span className="text-white/40 text-sm">あと</span>
            <span className="text-amber-400 text-5xl font-black leading-none">{remain}</span>
            <span className="text-amber-400 text-xl font-black pb-1">{unit}</span>
          </div>
        )}

        {/* プログレスバー（ゴールド） */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-white/30 text-[10px]">{current} / {target}{unit}</span>
            <span className="text-amber-400 text-[10px] font-bold">{pct}%</span>
          </div>
          <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, #b45309, #f59e0b, #fde68a)",
                boxShadow: "0 0 8px rgba(245,158,11,0.5)",
              }}
            />
          </div>
        </div>
      </div>
      {/* ゴールドフッター */}
      <div className="bg-amber-400/10 border-t border-amber-400/30 px-5 py-2">
        <span className="text-amber-700 text-[10px] font-semibold">{emoji} {badgeLabel}</span>
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
export default function MilestoneDashboard({ teamStats, pitchers, teamHistory }: MilestoneDashboardProps) {
  if (!teamStats) return <div className="px-5 py-8 text-center text-slate-400 text-sm">2026年度のデータがありません</div>;

  const totalKs = pitchers.reduce((s, p) => s + p.strikeouts, 0);
  const { lastYear, allTime } = teamHistory;

  return (
    <div className="flex flex-col gap-5 px-5 py-4 pb-8">
      {/* ヘッダー */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs mb-3 border border-[#1e3a5f]/20">
          <span>🏆</span><span>チームマイルストーン</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">記録への道</h1>
        <p className="text-slate-400 text-sm mt-1">2026年シーズン目標達成状況</p>
      </div>

      {/* 年末カウントダウン */}
      <YearEndBanner />

      {/* ── 特別枠：レジェンドマイルストーン ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px flex-1 bg-amber-300" />
          <span className="text-amber-600 text-[10px] font-black tracking-widest uppercase">Legend Milestones</span>
          <div className="h-px flex-1 bg-amber-300" />
        </div>
        <div className="flex flex-col gap-4">
          {/* 昨季超えカード */}
          <LegendCard
            emoji="🔥"
            badgeLabel="昨季超えへの挑戦 vs 2025"
            title={lastYear ? `2025年の${lastYear.wins}勝を超えろ！` : "昨季データなし"}
            note={lastYear ? `2025年シーズン勝利数：${lastYear.wins}勝` : ""}
            current={teamStats.wins}
            target={lastYear?.wins ?? 0}
            unit="勝"
            isNewRecord={teamStats.wins > (lastYear?.wins ?? Infinity)}
          />
          <LegendCard
            emoji="👑"
            badgeLabel="球団史を塗り替えろ！歴代最高記録"
            title={`歴代最高・${allTime.wins}勝の更新まであと${Math.max(allTime.wins - teamStats.wins + 1, 0)}勝！`}
            note={`歴代最高：通算 ${allTime.wins}勝 / 最多得点 ${allTime.runs}点`}
            current={teamStats.wins}
            target={allTime.wins + 1}
            unit="勝"
            isNewRecord={teamStats.wins >= allTime.wins + 1}
          />
        </div>
      </div>

      {/* ── 通常マイルストーン ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest">Season Goals</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
        <div className="flex flex-col gap-4">
          <MilestoneCard emoji="🏆" title="シーズン勝利数"   current={teamStats.wins}        step={10} unit="勝" />
          <MilestoneCard emoji="🔥" title="チーム総得点"     current={teamStats.runs}        step={50} unit="点" />
          <MilestoneCard emoji="💣" title="チーム本塁打"     current={teamStats.homeRuns}    step={10} unit="本" />
          <MilestoneCard emoji="⚡" title="投手陣・奪三振"   current={totalKs}               step={50} unit="K" />
          <MilestoneCard emoji="💨" title="チーム総盗塁"     current={teamStats.stolenBases} step={30} unit="盗塁" />
        </div>
      </div>
    </div>
  );
}
