"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import type { TeamSeasonStats } from "@/app/actions";

interface TeamLevelCardProps {
  teamStats: TeamSeasonStats | null;
  totalBases?: number;
}

function getTeamTitle(level: number): string {
  if (level >= 250) return "Goonies完全体";
  if (level >= 240) return "永遠の覇者";
  if (level >= 230) return "宇宙最強打線";
  if (level >= 220) return "神々の草野球";
  if (level >= 210) return "無敗の帝王";
  if (level >= 200) return "生ける伝説";
  if (level >= 190) return "球史に名を刻む者";
  if (level >= 180) return "アマチュア最高峰";
  if (level >= 170) return "全国大会の常連";
  if (level >= 160) return "投打の黄金バランス";
  if (level >= 150) return "破壊力抜群の打線";
  if (level >= 140) return "鉄壁の守備陣";
  if (level >= 130) return "草野球界のカリスマ";
  if (level >= 120) return "噂のタレント集団";
  if (level >= 110) return "百戦錬磨のベテラン軍団";
  if (level >= 100) return "都道府県ランカー";
  if (level >= 90) return "市区町村の覇者";
  if (level >= 80) return "A級昇格への道";
  if (level >= 70) return "地元密着の強豪";
  if (level >= 60) return "安定の中堅クラス";
  if (level >= 50) return "B級の実力派";
  if (level >= 40) return "市民大会のダークホース";
  if (level >= 30) return "初勝利の美酒";
  if (level >= 20) return "C級の刺客";
  if (level >= 10) return "週末エンジョイ勢";
  return "草野球ルーキー";
}

function calcExp(stats: TeamSeasonStats, totalBases: number = 0): number {
  return stats.wins * 5000 + stats.runs * 300 + stats.homeRuns * 1000 + totalBases * 200 + (stats.stolenBases || 0) * 300;
}

// ── カウントアップ Hook ────────────────────────────────────────
function useCountUp(target: number, duration = 1200): number {
  const [val, setVal] = useState(0);
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(ease * target));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return val;
}

export default function TeamLevelCard({ teamStats, totalBases = 0 }: TeamLevelCardProps) {
  if (!teamStats) return null;

  const exp = calcExp(teamStats, totalBases);
  const currentLv = Math.min(250, Math.floor(exp / 1000) + 1);
  const isMaxLevel = currentLv >= 250;

  const remainingExp = isMaxLevel ? 0 : 1000 - (exp % 1000);
  const pct = isMaxLevel ? 100 : (exp % 1000) / 1000 * 100;

  // カウントアップ
  const animLv = useCountUp(currentLv, 800);
  const animExp = useCountUp(exp, 1200);

  // 称号取得
  const teamTitle = getTeamTitle(animLv);

  // レベルに応じた星の数（50レベルごとに1つ増え、最大5つを適当に表示）
  const starsCount = Math.min(5, Math.ceil(animLv / 50) || 1);

  // EXPバーのinView
  const barRef = useRef<HTMLDivElement>(null);
  const inView = useInView(barRef, { once: true });

  return (
    <div className="mx-5 mb-1 rounded-2xl overflow-hidden border border-amber-200 shadow-md">
      {/* ゴールドグラデーションヘッダー */}
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
            <p className="text-amber-400/70 text-[10px] font-semibold tracking-wider uppercase mb-0.5">チームレベル</p>
            <div className="flex flex-col gap-1">
              <div className="flex items-end gap-2">
                <span className="text-white/50 text-2xl font-black leading-none">Lv.</span>
                <span
                  className="text-amber-400 text-6xl font-black leading-none"
                  style={{ textShadow: "0 0 24px rgba(251,191,36,0.4)" }}
                >
                  {animLv}
                </span>
              </div>
              {/* レベルごとの称号（バッジ風デザイン） */}
              <div className="inline-flex mt-1">
                <span className="text-xs font-bold text-slate-800 bg-amber-400/90 px-2 py-0.5 rounded-md shadow-sm border border-amber-300">
                  {teamTitle}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right flex flex-col justify-end">
            <div className="flex items-center justify-end gap-0.5 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`text-lg ${i < starsCount ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" : "text-white/10"}`}>★</span>
              ))}
            </div>
          </div>
        </div>

        {/* EXPバー（Gauge Fill） */}
        <div className="mt-4" ref={barRef}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-white/50 text-[10px] font-semibold">EXP</span>
            <span className="text-amber-400/80 text-[10px] font-bold">
              {isMaxLevel ? "MAX" : `${animExp.toLocaleString()} Total`}
            </span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: inView ? `${pct}%` : 0 }}
              transition={{ duration: 1.2, ease: "easeOut" as const }}
              style={{
                background: "linear-gradient(90deg, #f59e0b, #fbbf24, #fde68a)",
                boxShadow: "0 0 8px rgba(251,191,36,0.6)",
              }}
            />
          </div>
          {!isMaxLevel && (
            <p className="text-white/30 text-[9px] mt-1 text-right">
              次のレベルまで あと {remainingExp.toLocaleString()} EXP
            </p>
          )}
        </div>
      </div>

      {/* EXP内訳 */}
      <div className="bg-amber-50 border-t border-amber-200 px-5 py-2.5 flex items-center gap-4 flex-wrap">
        <p className="text-amber-700 text-[10px] font-bold tracking-wider uppercase shrink-0">
          EXP内訳 / Total {animExp.toLocaleString()}
        </p>
        <div className="flex gap-3 flex-wrap">
          <span className="text-amber-600 text-[10px]">⚔️ 勝利 {teamStats.wins}勝 × 5000</span>
          <span className="text-amber-600 text-[10px]">🔥 得点 {teamStats.runs}点 × 300</span>
          <span className="text-amber-600 text-[10px]">💣 本塁打 {teamStats.homeRuns}本 × 1000</span>
          <span className="text-amber-600 text-[10px]">⚾ 塁打 {totalBases}塁打 × 200</span>
          <span className="text-amber-600 text-[10px]">💨 盗塁 {teamStats.stolenBases || 0}個 × 300</span>
        </div>
      </div>
    </div>
  );
}
