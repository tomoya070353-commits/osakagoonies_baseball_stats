"use client";

import type { PlayerStats } from "@/types";
import type { TeamSeasonStats } from "@/app/actions";
import ContactChart from "@/components/ContactChart";
import { Users } from "lucide-react";

interface TeamDashboardProps {
  players: PlayerStats[];
  teamStats: TeamSeasonStats | null;
}

// ── 小カード（数値一覧用） ──────────────────────────────
function MiniCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-3 flex flex-col gap-0.5">
      <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-xl font-black text-[#1e3a5f] leading-none">{value}</p>
      {sub && <p className="text-slate-400 text-[10px]">{sub}</p>}
    </div>
  );
}

// ── チームWL大カード ──────────────────────────────────
function WinLossCard({ stats }: { stats: TeamSeasonStats }) {
  const winPct = stats.winRate.toFixed(3).replace(/^0/, "");
  return (
    <div className="bg-[#1e3a5f] rounded-2xl p-5 text-white flex flex-col gap-3">
      {/* 年度・試合数 */}
      <div className="flex items-center justify-between">
        <span className="text-white/60 text-xs font-semibold tracking-wider uppercase">{stats.year}年度</span>
        <span className="text-white/60 text-xs">{stats.games}試合</span>
      </div>

      {/* 勝敗 */}
      <div className="flex items-end gap-1.5">
        <span className="text-5xl font-black leading-none">{stats.wins}</span>
        <span className="text-white/50 text-lg font-bold mb-0.5">勝</span>
        <span className="text-3xl font-black leading-none ml-2">{stats.losses}</span>
        <span className="text-white/50 text-lg font-bold mb-0.5">敗</span>
        {stats.draws > 0 && (
          <>
            <span className="text-2xl font-black leading-none ml-2">{stats.draws}</span>
            <span className="text-white/50 text-base font-bold mb-0.5">分</span>
          </>
        )}
      </div>

      {/* 勝率バー */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-white/60 text-xs">勝率</span>
          <span className="text-white font-black text-lg">{winPct}</span>
        </div>
        <div className="w-full h-2 bg-white/20 rounded-full">
          <div
            className="h-full bg-white rounded-full transition-all duration-700"
            style={{ width: `${stats.winRate * 100}%` }}
          />
        </div>
      </div>

      {/* 得点・失点 */}
      <div className="flex gap-4 pt-1 border-t border-white/10">
        <div>
          <p className="text-white/50 text-[10px] uppercase tracking-wider">得点</p>
          <p className="text-white font-black text-xl">{stats.runs}</p>
        </div>
        <div className="w-px bg-white/20" />
        <div>
          <p className="text-white/50 text-[10px] uppercase tracking-wider">失点</p>
          <p className="text-white/70 font-black text-xl">{stats.runsAllowed}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-white/50 text-[10px] uppercase tracking-wider">得失点差</p>
          <p className={`font-black text-xl ${stats.runs - stats.runsAllowed >= 0 ? "text-emerald-300" : "text-red-300"}`}>
            {stats.runs - stats.runsAllowed >= 0 ? "+" : ""}{stats.runs - stats.runsAllowed}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TeamDashboard({ players, teamStats }: TeamDashboardProps) {
  if (players.length === 0) return null;

  // ── チーム合算のContactChart用ダミーオブジェクト ──
  const teamAggregate = {
    grounders: players.reduce((s, p) => s + p.grounders, 0),
    flies:     players.reduce((s, p) => s + p.flies, 0),
    liners:    players.reduce((s, p) => s + p.liners, 0),
  } as PlayerStats;

  return (
    <div className="flex flex-col gap-5 py-4 pb-8">
      {/* ヘッダー */}
      <div className="px-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs mb-3 border border-[#1e3a5f]/20">
          <Users size={12} />
          <span>{players.length}名登録</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">チーム</h1>
        <p className="text-slate-400 text-sm mt-1">Osaka Goonies — 2026年度</p>
      </div>

      {/* 勝敗ビッグカード */}
      {teamStats ? (
        <div className="px-5 flex flex-col gap-4">
          <WinLossCard stats={teamStats} />

          {/* 打撃・投手指標グリッド */}
          <div>
            <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-2">打撃成績</p>
            <div className="grid grid-cols-3 gap-2">
              <MiniCard label="打率" value={teamStats.avg.toFixed(3).replace(/^0/, "")} />
              <MiniCard label="本塁打" value={`${teamStats.homeRuns}`} sub="本" />
              <MiniCard label="盗塁" value={`${teamStats.stolenBases}`} sub="個" />
            </div>
          </div>

          <div>
            <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-2">投手成績</p>
            <div className="grid grid-cols-2 gap-2">
              <MiniCard label="防御率" value={teamStats.era.toFixed(2)} />
              <MiniCard label="失点" value={`${teamStats.runsAllowed}`} sub="点" />
            </div>
          </div>
        </div>
      ) : (
        <div className="px-5">
          <p className="text-slate-400 text-sm text-center py-6">2026年度のデータがありません</p>
        </div>
      )}

      {/* フライ・ゴロ比率 */}
      <div className="px-5">
        <ContactChart player={teamAggregate} />
      </div>
    </div>
  );
}
