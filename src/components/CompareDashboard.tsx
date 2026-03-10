"use client";

import { useState } from "react";
import type { PlayerStats } from "@/types";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown, Check } from "lucide-react";

const NAVY = "#1e3a5f";
const RED  = "#dc2626";

// ── 選手セレクター ─────────────────────────────
function PlayerSelector({
  players,
  selected,
  onSelect,
  color,
  label,
}: {
  players: PlayerStats[];
  selected: PlayerStats;
  onSelect: (p: PlayerStats) => void;
  color: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex-1">
      {/* ラベル */}
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color }}>
        {label}
      </p>
      {/* トリガー */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-1 px-3 py-2 rounded-xl border-2 bg-white"
        style={{ borderColor: color }}
      >
        <span className="font-bold text-sm truncate" style={{ color }}>
          {selected.name}
        </span>
        <ChevronDown size={14} style={{ color }} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {/* ドロップダウン */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white rounded-xl shadow-xl border border-slate-200 max-h-52 overflow-y-auto">
          {players.map((p) => {
            const isSel = p.name === selected.name;
            return (
              <button
                key={p.name}
                onClick={() => { onSelect(p); setOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-slate-50 transition-colors ${isSel ? "font-bold" : ""}`}
                style={{ color: isSel ? color : "#334155" }}
              >
                <span className="truncate">{p.name}</span>
                {isSel && <Check size={14} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── スタッツ比較行 ─────────────────────────────
function CompareRow({
  label,
  valA,
  valB,
  format = (v: number) => String(v),
  higherIsBetter = true,
}: {
  label: string;
  valA: number;
  valB: number;
  format?: (v: number) => string;
  higherIsBetter?: boolean;
}) {
  const aWins = higherIsBetter ? valA > valB : valA < valB;
  const bWins = higherIsBetter ? valB > valA : valB < valA;

  return (
    <div className="flex items-center py-2.5 border-b border-slate-100 last:border-0">
      {/* 選手A */}
      <div className="flex-1 text-right pr-3">
        <span
          className={`text-base ${aWins ? "font-black" : "font-normal text-slate-400"}`}
          style={{ color: aWins ? NAVY : undefined }}
        >
          {format(valA)}
        </span>
      </div>
      {/* 項目名 */}
      <div className="w-20 text-center">
        <span className="text-slate-400 text-xs font-semibold">{label}</span>
      </div>
      {/* 選手B */}
      <div className="flex-1 text-left pl-3">
        <span
          className={`text-base ${bWins ? "font-black" : "font-normal text-slate-400"}`}
          style={{ color: bWins ? RED : undefined }}
        >
          {format(valB)}
        </span>
      </div>
    </div>
  );
}

// ── メインコンポーネント ───────────────────────
interface CompareDashboardProps {
  players: PlayerStats[];
}

export default function CompareDashboard({ players }: CompareDashboardProps) {
  const [playerA, setPlayerA] = useState(players[0]);
  const [playerB, setPlayerB] = useState(players[1] ?? players[0]);

  const radarData = [
    { subject: "ミート",   A: playerA.meet,   B: playerB.meet   },
    { subject: "パワー",   A: playerA.power,  B: playerB.power  },
    { subject: "走力",     A: playerA.speed,  B: playerB.speed  },
    { subject: "選球眼",   A: playerA.eye,    B: playerB.eye    },
    { subject: "勝負強さ", A: playerA.clutch, B: playerB.clutch },
  ];

  return (
    <div className="flex flex-col gap-5 px-5 py-4 pb-8">
      {/* ヘッダー */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs mb-3 border border-[#1e3a5f]/20">
          <span>⚔️</span>
          <span>選手比較 VSモード</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">比較</h1>
        <p className="text-slate-400 text-sm mt-1">2人の選手を選んで能力を比較</p>
      </div>

      {/* 選手セレクター */}
      <div className="flex gap-3 items-start">
        <PlayerSelector players={players} selected={playerA} onSelect={setPlayerA} color={NAVY} label="選手 A" />
        <div className="flex items-end pb-2 text-slate-300 font-black text-lg">VS</div>
        <PlayerSelector players={players} selected={playerB} onSelect={setPlayerB} color={RED}  label="選手 B" />
      </div>

      {/* VSレーダーチャート */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Radar Chart</p>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: NAVY }} />
              <span className="font-semibold" style={{ color: NAVY }}>{playerA.name}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: RED }} />
              <span className="font-semibold" style={{ color: RED }}>{playerB.name}</span>
            </span>
          </div>
        </div>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%">
              <PolarGrid stroke="rgba(0,0,0,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              {/* 選手B（赤・下に描画） */}
              <Radar name={playerB.name} dataKey="B"
                stroke={RED} fill={RED} fillOpacity={0.18} strokeWidth={2}
                dot={{ fill: RED, r: 3 }}
              />
              {/* 選手A（ネイビー・上に描画） */}
              <Radar name={playerA.name} dataKey="A"
                stroke={NAVY} fill={NAVY} fillOpacity={0.18} strokeWidth={2}
                dot={{ fill: NAVY, r: 3 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* スタッツ比較テーブル */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        {/* ヘッダー行 */}
        <div className="flex items-center py-2.5 px-4 bg-slate-50 border-b border-slate-200">
          <div className="flex-1 text-right pr-3">
            <span className="text-sm font-bold" style={{ color: NAVY }}>{playerA.name}</span>
          </div>
          <div className="w-20 text-center">
            <span className="text-slate-400 text-xs font-semibold">項目</span>
          </div>
          <div className="flex-1 text-left pl-3">
            <span className="text-sm font-bold" style={{ color: RED }}>{playerB.name}</span>
          </div>
        </div>
        {/* 各スタッツ行 */}
        <div className="px-4">
          <CompareRow label="打率"   valA={playerA.avg}        valB={playerB.avg}        format={(v) => v.toFixed(3).replace(/^0/, "")} />
          <CompareRow label="OPS"    valA={playerA.ops}        valB={playerB.ops}        format={(v) => v.toFixed(3).replace(/^0/, "")} />
          <CompareRow label="本塁打" valA={playerA.homeRuns}   valB={playerB.homeRuns}   format={(v) => `${v}本`} />
          <CompareRow label="打点"   valA={playerA.rbi}        valB={playerB.rbi}        format={(v) => `${v}`} />
          <CompareRow label="安打"   valA={playerA.hits}       valB={playerB.hits}       format={(v) => `${v}`} />
          <CompareRow label="盗塁"   valA={playerA.stolenBases} valB={playerB.stolenBases} format={(v) => `${v}`} />
          <CompareRow label="四球"   valA={playerA.walks}      valB={playerB.walks}      format={(v) => `${v}`} />
          <CompareRow label="三振率" valA={playerA.kRate}      valB={playerB.kRate}      format={(v) => `${(v * 100).toFixed(1)}%`} higherIsBetter={false} />
        </div>
      </div>
    </div>
  );
}
