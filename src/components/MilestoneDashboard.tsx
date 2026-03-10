"use client";

import type { TeamSeasonStats } from "@/app/actions";

interface MilestoneDashboardProps {
  teamStats: TeamSeasonStats | null;
}

// 歴代最高データ（CSV確認済）
const RECORDS = {
  runs:         287,  // 2025年
  stolenBases:  102,  // 2025年
};

// プログレスバーコンポーネント
function ProgressBar({ pct, hot }: { pct: number; hot: boolean }) {
  const capped = Math.min(pct, 100);
  return (
    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${
          capped >= 100
            ? "bg-emerald-500"
            : hot
            ? "bg-[#dc2626] animate-pulse"
            : "bg-[#1e3a5f]"
        }`}
        style={{ width: `${capped}%` }}
      />
    </div>
  );
}

// マイルストーンカード
function MilestoneCard({
  emoji,
  title,
  current,
  target,
  unit,
  suffix,
  note,
}: {
  emoji: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  suffix?: string;
  note?: string;
}) {
  const pct     = target === 0 ? 100 : Math.round((current / target) * 100);
  const remain  = Math.max(target - current, 0);
  const done    = current >= target;
  const hot     = pct >= 80 && !done;

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden shadow-sm ${hot ? "border-[#dc2626]/40" : "border-slate-200"}`}>
      {/* ヘッダー */}
      <div className={`flex items-center justify-between px-5 pt-5 pb-3 ${hot ? "bg-red-50/50" : ""}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <p className="font-bold text-slate-700 text-sm leading-tight">{title}</p>
        </div>
        {done
          ? <span className="text-xs font-bold text-white bg-emerald-500 px-2 py-0.5 rounded-full">✓ 達成！</span>
          : hot
          ? <span className="text-xs font-bold text-[#dc2626] bg-red-100 px-2 py-0.5 rounded-full animate-pulse">🔥 王手！</span>
          : null
        }
      </div>

      {/* 大数字「あと○○」*/}
      <div className="px-5 pb-2">
        {done ? (
          <p className="text-4xl font-black text-emerald-500 leading-none">目標達成🎉</p>
        ) : (
          <div className="flex items-end gap-1.5">
            <span className="text-slate-400 text-sm font-semibold">あと</span>
            <span className={`text-4xl font-black leading-none ${hot ? "text-[#dc2626]" : "text-[#1e3a5f]"}`}>
              {remain.toLocaleString()}
            </span>
            <span className={`text-lg font-bold mb-0.5 ${hot ? "text-[#dc2626]" : "text-[#1e3a5f]"}`}>{unit}</span>
            {suffix && <span className="text-slate-400 text-sm mb-0.5">で{suffix}</span>}
          </div>
        )}
      </div>

      {/* プログレスバー + 達成率 */}
      <div className="px-5 pb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-slate-400 text-xs">{current.toLocaleString()} / {target.toLocaleString()}</span>
          <span className={`text-xs font-bold ${pct >= 100 ? "text-emerald-500" : hot ? "text-[#dc2626]" : "text-[#1e3a5f]"}`}>
            {Math.min(pct, 100)}%
          </span>
        </div>
        <ProgressBar pct={pct} hot={hot} />
        {note && <p className="text-slate-400 text-[10px] mt-1.5">{note}</p>}
      </div>
    </div>
  );
}

// 年末カウントダウンバナー
function YearEndBanner() {
  const now      = new Date();
  const yearEnd  = new Date(now.getFullYear(), 11, 31); // 12月31日
  const diffMs   = yearEnd.getTime() - now.getTime();
  const days     = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

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

export default function MilestoneDashboard({ teamStats }: MilestoneDashboardProps) {
  const wins   = teamStats?.wins         ?? 0;
  const runs   = teamStats?.runs         ?? 0;
  const hrs    = teamStats?.homeRuns     ?? 0;
  const sb     = teamStats?.stolenBases  ?? 0;

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

      {/* マイルストーンカード一覧 */}
      <MilestoneCard
        emoji="🏆"
        title="シーズン10勝への道"
        current={wins}
        target={10}
        unit="勝"
        suffix="達成！"
        note="チーム目標：2026年シーズン10勝"
      />
      <MilestoneCard
        emoji="⚡"
        title="チーム2桁本塁打への挑戦"
        current={hrs}
        target={10}
        unit="本"
        suffix="2桁本塁打！"
        note="チーム目標：シーズン10本塁打"
      />
      <MilestoneCard
        emoji="🔥"
        title="チーム史上最多得点更新"
        current={runs}
        target={RECORDS.runs}
        unit="点"
        suffix="新記録！"
        note={`歴代最高：2025年シーズン ${RECORDS.runs}点`}
      />
      <MilestoneCard
        emoji="💨"
        title="チーム史上最多盗塁数更新"
        current={sb}
        target={RECORDS.stolenBases}
        unit="盗塁"
        suffix="新記録！"
        note={`歴代最高：2025年シーズン ${RECORDS.stolenBases}盗塁`}
      />
    </div>
  );
}
