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
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm w-full">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
        打順別成績
      </h3>

      <div className="flex justify-between items-center text-xs text-slate-400 pb-2 border-b border-slate-100 px-2">
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
              className={`flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0 px-2 ${
                isZero ? "opacity-50" : ""
              }`}
            >
              <div className="w-10 flex justify-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isHighest
                      ? "bg-[#1e3a5f] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {stat.order}
                </div>
              </div>

              <div className="flex-1 text-center text-sm font-medium text-slate-700 tracking-wide">
                {stat.atBats} - {stat.hits}
              </div>

              <div
                className={`w-12 text-right text-sm ${
                  isHighest ? "text-red-600 font-bold" : "text-slate-700 font-semibold"
                }`}
              >
                {isZero ? "-" : stat.avg.toFixed(3).replace(/^0/, "")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
