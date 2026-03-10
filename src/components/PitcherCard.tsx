"use client";

import type { PitcherStats } from "@/app/actions";

interface PitcherCardProps {
  pitcher: PitcherStats;
}

// 小グリッドのセル
function StatCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`flex flex-col items-center p-3 rounded-xl ${accent ? "bg-[#1e3a5f] text-white" : "bg-slate-50 border border-slate-200"}`}>
      <span className={`text-[10px] font-semibold uppercase tracking-wider mb-0.5 ${accent ? "text-white/60" : "text-slate-400"}`}>
        {label}
      </span>
      <span className={`text-xl font-black leading-none ${accent ? "text-white" : "text-[#1e3a5f]"}`}>
        {value}
      </span>
    </div>
  );
}

export default function PitcherCard({ pitcher }: PitcherCardProps) {
  const winRateStr = pitcher.winRate === 0 && pitcher.wins === 0 && pitcher.losses === 0
    ? "—"
    : pitcher.winRate.toFixed(3).replace(/^0/, "");
  const eraStr = pitcher.era.toFixed(2);

  return (
    <div className="px-5 flex flex-col gap-4">
      {/* ヘッダー行：防御率 + 投球回 + 勝敗 */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4">
        {/* 投手アイコン + 主要数値ヘッダー */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center text-xl">
            🏟️
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Pitching Stats</p>
            <p className="text-slate-700 text-sm font-bold">{pitcher.games}試合登板</p>
          </div>
        </div>

        {/* 防御率（大フィーチャー） */}
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2a5298] rounded-xl p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">防御率 ERA</p>
            <p className="text-white text-4xl font-black">{eraStr}</p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs">投球回</p>
            <p className="text-white text-2xl font-black">{pitcher.innings}</p>
          </div>
        </div>

        {/* 勝敗セーブ グリッド */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <StatCell label="勝" value={`${pitcher.wins}`} accent />
          <StatCell label="敗" value={`${pitcher.losses}`} />
          <StatCell label="S" value={`${pitcher.saves}`} />
          <StatCell label="勝率" value={winRateStr} />
        </div>

        {/* 詳細グリッド */}
        <div className="grid grid-cols-3 gap-2">
          <StatCell label="奪三振" value={`${pitcher.strikeouts}`} />
          <StatCell label="与四死球" value={`${pitcher.walksHBP}`} />
          <StatCell label="被安打" value={`${pitcher.hitsAllowed}`} />
          <StatCell label="完投" value={`${pitcher.completeGames}`} />
          <StatCell label="完封" value={`${pitcher.shutouts}`} />
          <StatCell label="失点" value={`${pitcher.runsAllowed}`} />
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
