"use client";

import type { TeamSeasonStats } from "@/app/actions";

interface TeamLevelCardProps {
  teamStats: TeamSeasonStats | null;
}

// ── レベル定義テーブル ─────────────────────────────────────────
const LEVELS = [
  { lv: 1,  expMin: 0,    expMax: 299,  title: "まだまだひよっこ",          stars: 1 },
  { lv: 2,  expMin: 300,  expMax: 599,  title: "新進気鋭の若駒",            stars: 1 },
  { lv: 3,  expMin: 600,  expMax: 999,  title: "浪速の挑戦者",              stars: 2 },
  { lv: 4,  expMin: 1000, expMax: 1499, title: "浪速のダークホース",        stars: 2 },
  { lv: 5,  expMin: 1500, expMax: 2099, title: "大阪の猛者",                stars: 3 },
  { lv: 6,  expMin: 2100, expMax: 2799, title: "関西の強豪",                stars: 3 },
  { lv: 7,  expMin: 2800, expMax: 3599, title: "西の鉄砲玉",                stars: 4 },
  { lv: 8,  expMin: 3600, expMax: 4499, title: "伝説への序章",              stars: 4 },
  { lv: 9,  expMin: 4500, expMax: 5499, title: "覇王への道",                stars: 5 },
  { lv: 10, expMin: 5500, expMax: 9999, title: "🔥 大阪グニーズ覇王 🔥",   stars: 5 },
];

function calcExp(stats: TeamSeasonStats): number {
  return stats.wins * 100 + stats.runs * 10 + stats.homeRuns * 50;
}

function getLevelData(exp: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (exp >= LEVELS[i].expMin) return LEVELS[i];
  }
  return LEVELS[0];
}

export default function TeamLevelCard({ teamStats }: TeamLevelCardProps) {
  if (!teamStats) return null;

  const exp       = calcExp(teamStats);
  const levelData = getLevelData(exp);
  const nextLevel = LEVELS.find((l) => l.lv === levelData.lv + 1);

  // 次レベルまでのプログレス
  const expInLevel  = exp - levelData.expMin;
  const expNeeded   = nextLevel ? nextLevel.expMin - levelData.expMin : levelData.expMax - levelData.expMin;
  const pct         = nextLevel ? Math.min((expInLevel / expNeeded) * 100, 100) : 100;
  const isMaxLevel  = !nextLevel;

  return (
    <div className="mx-5 mb-1 rounded-2xl overflow-hidden border border-amber-200 shadow-md">
      {/* ── ゴールドグラデーションヘッダー ── */}
      <div className="bg-gradient-to-r from-[#1e3a5f] via-[#1e3a5f] to-[#1a2f4a] px-5 pt-5 pb-4">
        {/* RPGアクセント線 */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px flex-1 bg-amber-400/30" />
          <span className="text-amber-400 text-[9px] font-bold tracking-[0.3em] uppercase">Team Status</span>
          <div className="h-px flex-1 bg-amber-400/30" />
        </div>

        {/* レベル + 称号 */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-amber-400/70 text-[10px] font-semibold tracking-wider uppercase mb-0.5">
              チームレベル
            </p>
            <div className="flex items-end gap-2">
              <span className="text-white/50 text-2xl font-black leading-none">Lv.</span>
              <span className="text-amber-400 text-6xl font-black leading-none" style={{ textShadow: "0 0 24px rgba(251,191,36,0.4)" }}>
                {levelData.lv}
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-amber-300 text-sm font-black leading-tight max-w-[140px] text-right">
              {levelData.title}
            </p>
            <div className="flex items-center justify-end gap-0.5 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`text-sm ${i < levelData.stars ? "text-amber-400" : "text-white/10"}`}>
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* EXPバー */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-white/50 text-[10px] font-semibold">EXP</span>
            <span className="text-amber-400/80 text-[10px] font-bold">
              {isMaxLevel ? "MAX" : `${expInLevel.toLocaleString()} / ${expNeeded.toLocaleString()}`}
            </span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 relative"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, #f59e0b, #fbbf24, #fde68a)",
                boxShadow: "0 0 8px rgba(251,191,36,0.6)",
              }}
            />
          </div>
          {!isMaxLevel && (
            <p className="text-white/30 text-[9px] mt-1 text-right">
              次のレベルまで あと {(expNeeded - expInLevel).toLocaleString()} EXP
            </p>
          )}
        </div>
      </div>

      {/* ── EXP内訳（ゴールドボトムバー） ── */}
      <div className="bg-amber-50 border-t border-amber-200 px-5 py-2.5 flex items-center gap-4 flex-wrap">
        <p className="text-amber-700 text-[10px] font-bold tracking-wider uppercase shrink-0">EXP内訳 / Total {exp.toLocaleString()}</p>
        <div className="flex gap-3 flex-wrap">
          <span className="text-amber-600 text-[10px]">⚔️ 勝利 {teamStats.wins}勝 × 100</span>
          <span className="text-amber-600 text-[10px]">🔥 得点 {teamStats.runs}点 × 10</span>
          <span className="text-amber-600 text-[10px]">💣 本塁打 {teamStats.homeRuns}本 × 50</span>
        </div>
      </div>
    </div>
  );
}
