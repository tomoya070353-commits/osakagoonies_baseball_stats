"use client";

import { useState } from "react";
import type { PlayerStats } from "@/types";
import type { PitcherStats } from "@/app/actions";
import { ChevronDown, Check } from "lucide-react";

interface SalaryDashboardProps {
  players: PlayerStats[];
  pitchers: PitcherStats[];
}

// 給与計算ロジック
function calcSalary(player: PlayerStats, pitcher: PitcherStats | undefined): number {
  let salary = 10_000_000; // 基本給
  salary += player.hits       * 500_000;
  salary += player.homeRuns   * 1_000_000;
  salary += player.rbi        * 300_000;
  salary += player.stolenBases * 100_000;
  salary -= player.strikeouts  * 50_000;
  if (pitcher) {
    salary += pitcher.wins      * 700_000;
    salary += pitcher.strikeouts * 100_000;
  }
  return Math.max(salary, 0);
}

// 内訳行
function LineItem({
  label,
  amount,
  positive = true,
}: {
  label: string;
  amount: number;
  positive?: boolean;
}) {
  if (amount === 0) return null;
  return (
    <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-200 last:border-0">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className={`text-sm font-semibold ${positive ? "text-emerald-600" : "text-red-500"}`}>
        {positive ? "+" : "-"}¥{amount.toLocaleString()}
      </span>
    </div>
  );
}

// 選手セレクタ（シンプル版）
function PlayerSelect({
  players,
  selected,
  onSelect,
}: {
  players: PlayerStats[];
  selected: PlayerStats;
  onSelect: (p: PlayerStats) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#1e3a5f] bg-white"
      >
        <span className="font-bold text-[#1e3a5f]">{selected.name}</span>
        <ChevronDown size={14} className={`text-[#1e3a5f] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-xl shadow-xl border border-slate-200 max-h-52 overflow-y-auto min-w-[180px]">
          {players.map((p) => {
            const isSel = p.name === selected.name;
            return (
              <button
                key={p.name}
                onClick={() => { onSelect(p); setOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-slate-50 transition-colors ${isSel ? "font-bold text-[#1e3a5f]" : "text-slate-700"}`}
              >
                <span>{p.name}</span>
                {isSel && <Check size={14} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ランク判定
function getSalaryRank(salary: number): { label: string; color: string; emoji: string } {
  if (salary >= 60_000_000) return { label: "スーパースター", color: "text-amber-500",   emoji: "🌟" };
  if (salary >= 40_000_000) return { label: "主力選手",       color: "text-[#1e3a5f]",   emoji: "💪" };
  if (salary >= 25_000_000) return { label: "レギュラー",     color: "text-emerald-600", emoji: "✅" };
  if (salary >= 15_000_000) return { label: "準レギュラー",   color: "text-slate-600",   emoji: "📈" };
  return                           { label: "育成選手",       color: "text-slate-400",   emoji: "🌱" };
}

export default function SalaryDashboard({ players, pitchers }: SalaryDashboardProps) {
  const filteredPlayers = players.filter((p) => !p.name.includes("助っ人"));
  const [selected, setSelected] = useState(filteredPlayers[0]);

  const pitcher  = pitchers.find((p) => p.name === selected.name);
  const salary   = calcSalary(selected, pitcher);
  const rank     = getSalaryRank(salary);
  const basePay  = 10_000_000;

  // 内訳
  const hitBonus    = selected.hits        * 500_000;
  const hrBonus     = selected.homeRuns    * 1_000_000;
  const rbiBonus    = selected.rbi         * 300_000;
  const sbBonus     = selected.stolenBases * 100_000;
  const kPenalty    = selected.strikeouts  * 50_000;
  const winBonus    = pitcher ? pitcher.wins       * 700_000  : 0;
  const kpBonus     = pitcher ? pitcher.strikeouts * 100_000  : 0;

  return (
    <div className="flex flex-col gap-5 px-5 py-4 pb-8">
      {/* ヘッダー */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs mb-3 border border-[#1e3a5f]/20">
          <span>💰</span><span>推定年俸システム</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">査定・推定年俸</h1>
        <p className="text-slate-400 text-sm mt-1">スタッツから自動計算（あくまで参考です！）</p>
      </div>

      {/* 選手選択 */}
      <PlayerSelect players={filteredPlayers} selected={selected} onSelect={setSelected} />

      {/* メイン給与カード */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2a5298] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-1">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">推定年俸</p>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 ${rank.color}`}>
            {rank.emoji} {rank.label}
          </span>
        </div>
        <p className="text-4xl font-black tracking-tight mt-1">
          ¥{salary.toLocaleString()}
        </p>
        <p className="text-white/50 text-xs mt-2">{selected.name} — 2026年度シーズン評価</p>

        {/* 遊び心コメント */}
        <div className="mt-4 pt-3 border-t border-white/10">
          {salary >= 60_000_000 && <p className="text-amber-300 text-sm font-bold">🚀 球団の至宝！他球団も狙っているぞ！</p>}
          {salary >= 40_000_000 && salary < 60_000_000 && <p className="text-blue-200 text-sm font-bold">💼 主力としての貢献に感謝します！</p>}
          {salary >= 25_000_000 && salary < 40_000_000 && <p className="text-emerald-300 text-sm font-bold">📊 安定した成績、来季も期待！</p>}
          {salary >= 15_000_000 && salary < 25_000_000 && <p className="text-slate-300 text-sm font-bold">📈 もう一押しで昇給圏内！</p>}
          {salary < 15_000_000 && <p className="text-slate-400 text-sm font-bold">🌱 育成期間中。次戦での活躍を期待！</p>}
        </div>
      </div>

      {/* 給与明細カード */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        {/* 明細ヘッダー */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">給与明細書</p>
          <p className="text-slate-400 text-xs">2026年度</p>
        </div>
        <div className="px-5 py-2">
          {/* 基本給 */}
          <div className="flex items-center justify-between py-2 border-b border-slate-200">
            <span className="text-slate-700 text-sm font-semibold">基本給</span>
            <span className="text-slate-700 text-sm font-semibold">¥{basePay.toLocaleString()}</span>
          </div>
          {/* 加算 */}
          <LineItem label={`安打ボーナス（${selected.hits}本 × ¥500,000）`}    amount={hitBonus}  />
          <LineItem label={`本塁打ボーナス（${selected.homeRuns}本 × ¥1,000,000）`} amount={hrBonus} />
          <LineItem label={`打点ボーナス（${selected.rbi}点 × ¥300,000）`}      amount={rbiBonus}  />
          <LineItem label={`盗塁ボーナス（${selected.stolenBases}個 × ¥100,000）`} amount={sbBonus} />
          {winBonus > 0 && <LineItem label={`投手勝利ボーナス（${pitcher!.wins}勝 × ¥700,000）`}      amount={winBonus} />}
          {kpBonus  > 0 && <LineItem label={`奪三振ボーナス（${pitcher!.strikeouts}K × ¥100,000）`}   amount={kpBonus}  />}
          {/* 減算 */}
          <LineItem label={`三振ペナルティ（${selected.strikeouts}K × ¥50,000）`} amount={kPenalty} positive={false} />
        </div>
        {/* 合計 */}
        <div className="bg-[#1e3a5f]/5 border-t border-[#1e3a5f]/20 px-5 py-3 flex items-center justify-between">
          <span className="text-[#1e3a5f] font-black">推定年俸合計</span>
          <span className="text-[#1e3a5f] font-black text-lg">¥{salary.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
