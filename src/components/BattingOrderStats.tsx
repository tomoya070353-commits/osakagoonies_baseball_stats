"use client";

import type { PlayerStats } from "@/types";

export default function BattingOrderStats({ player }: { player: PlayerStats }) {
  // 1番から9番までの打順別成績を集計する
  const orderStats = Array.from({ length: 9 }, (_, i) => ({
    order: i + 1,
    atBats: 0,
    hits: 0,
    avg: 0,
  }));

  player.games.forEach((game) => {
    // 1桁の数字（打順）か判定
    const orderNum = parseInt(game.battingOrder, 10);
    if (isNaN(orderNum) || orderNum < 1 || orderNum > 9) return;

    const stat = orderStats[orderNum - 1];

    game.atBats.forEach((ab) => {
      // 四死球、犠打、犠飛を除外して打数をカウント
      if (!ab.isWalkOrHBP && !ab.isSacrificeBunt && !ab.isSacrificeFly) {
        stat.atBats += 1;
        if (ab.isHit) {
          stat.hits += 1;
        }
      }
    });
  });

  // 打率の計算および最高打率の検索
  let maxAvg = -1;
  let maxOrder = -1;

  orderStats.forEach((stat) => {
    stat.avg = stat.atBats > 0 ? stat.hits / stat.atBats : 0;
    // 打数が1以上の場合のみ最高打率の更新候補にする
    if (stat.atBats > 0 && stat.avg > maxAvg) {
      maxAvg = stat.avg;
      maxOrder = stat.order;
    }
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-4.5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] w-full">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3.5 px-1">
        打順別成績
      </h3>

      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100/50 px-2">
        <span className="w-10 text-center">打順</span>
        <span className="flex-1 text-center">打数 - 安打</span>
        <span className="w-12 text-right">打率</span>
      </div>

      <div className="flex flex-col">
        {orderStats.map((stat) => {
          const isHighest = stat.atBats > 0 && stat.order === maxOrder && maxAvg > 0;
          const isZero = stat.atBats === 0;

          return (
            <div
              key={stat.order}
              className={`flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0 px-2 transition-colors duration-200 hover:bg-slate-50/40 rounded-xl ${
                isZero ? "opacity-40" : ""
              }`}
            >
              <div className="w-10 flex justify-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    isHighest
                      ? "bg-gradient-to-br from-[#1e3a5f] to-[#319795] text-white shadow-sm scale-105"
                      : "bg-slate-100/80 text-slate-500 border border-slate-200/20"
                  }`}
                >
                  {stat.order}
                </div>
              </div>

              <div className="flex-1 text-center text-sm font-semibold text-slate-700 tracking-wide">
                {stat.atBats} <span className="text-slate-300 font-normal">/</span> {stat.hits}
              </div>

              <div
                className={`w-12 text-right text-sm font-mono ${
                  isHighest ? "text-[#e53e3e] font-extrabold" : "text-slate-600 font-bold"
                }`}
              >
                {isZero ? "—" : stat.avg.toFixed(3).replace(/^0/, ".")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
