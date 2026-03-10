"use client";

import type { PitcherStats } from "@/app/actions";

// 小グリッドのセル（accentなし統一）
function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50 border border-slate-200">
      <span className="text-[10px] font-semibold uppercase tracking-wider mb-0.5 text-slate-400">
        {label}
      </span>
      <span className="text-xl font-black leading-none text-[#1e3a5f]">
        {value}
      </span>
    </div>
  );
}

export default function PitcherCard({ pitcher }: { pitcher: PitcherStats }) {
  const winRateStr =
    pitcher.winRate === 0 && pitcher.wins === 0 && pitcher.losses === 0
      ? "—"
      : pitcher.winRate.toFixed(3).replace(/^0/, "");

  return (
    <div className="px-5 flex flex-col gap-4">

      {/* ── ブロック1: 防御率（ERA）のみ ── */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2a5298] rounded-2xl p-5">
        <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">
          防御率 ERA
        </p>
        <p className="text-white text-6xl font-black leading-none">
          {pitcher.era.toFixed(2)}
        </p>
        <p className="text-white/40 text-xs mt-2">🏟️ Pitching Stats — {pitcher.games}試合登板</p>
      </div>

      {/* ── ブロック2: 試合数・投球回・勝敗・勝率 ── */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4">
        <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-3">
          勝敗・投球
        </p>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <StatCell label="試合数" value={`${pitcher.games}`} />
          <StatCell label="投球回" value={pitcher.innings} />
          <StatCell label="勝率"   value={winRateStr} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <StatCell label="勝" value={`${pitcher.wins}`} />
          <StatCell label="敗" value={`${pitcher.losses}`} />
          <StatCell label="セーブ" value={`${pitcher.saves}`} />
        </div>
      </div>

      {/* ── ブロック3: 投球詳細 ── */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4">
        <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-3">
          投球詳細
        </p>
        <div className="grid grid-cols-3 gap-2">
          <StatCell label="奪三振"   value={`${pitcher.strikeouts}`} />
          <StatCell label="与四死球" value={`${pitcher.walksHBP}`} />
          <StatCell label="被安打"   value={`${pitcher.hitsAllowed}`} />
          <StatCell label="完投"     value={`${pitcher.completeGames}`} />
          <StatCell label="完封"     value={`${pitcher.shutouts}`} />
          <StatCell label="失点"     value={`${pitcher.runsAllowed}`} />
        </div>
      </div>

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
