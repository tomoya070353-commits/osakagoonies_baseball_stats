"use client";

import { useState } from "react";
import type { PlayerStats } from "@/types";
import type { PitcherStats, TeamSeasonStats } from "@/app/actions";
import CompareDashboard from "@/components/CompareDashboard";
import SalaryDashboard from "@/components/SalaryDashboard";
import MilestoneDashboard from "@/components/MilestoneDashboard";
import { ChevronRight } from "lucide-react";

type SubView = null | "compare" | "salary" | "milestone";

interface ClubhouseDashboardProps {
  players: PlayerStats[];
  pitchers: PitcherStats[];
  teamStats: TeamSeasonStats | null;
}

const MENU_ITEMS = [
  {
    id: "milestone" as const,
    emoji: "🏆",
    title: "チームマイルストーン",
    subtitle: "記録への道・目標達成状況",
    accent: "#1e3a5f",
  },
  {
    id: "compare" as const,
    emoji: "⚖️",
    title: "選手比較",
    subtitle: "2人の選手をVSモードで比較",
    accent: "#7c3aed",
  },
  {
    id: "salary" as const,
    emoji: "💰",
    title: "査定・推定年俸",
    subtitle: "スタッツから年俸を自動計算",
    accent: "#059669",
  },
];

export default function ClubhouseDashboard({ players, pitchers, teamStats }: ClubhouseDashboardProps) {
  const [subView, setSubView] = useState<SubView>(null);

  if (subView === "milestone") {
    return (
      <div>
        <BackBar label="🏆 チームマイルストーン" onBack={() => setSubView(null)} />
        <MilestoneDashboard teamStats={teamStats} />
      </div>
    );
  }
  if (subView === "compare") {
    return (
      <div>
        <BackBar label="⚖️ 選手比較" onBack={() => setSubView(null)} />
        <CompareDashboard players={players} />
      </div>
    );
  }
  if (subView === "salary") {
    return (
      <div>
        <BackBar label="💰 査定・推定年俸" onBack={() => setSubView(null)} />
        <SalaryDashboard players={players} pitchers={pitchers} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-5 py-4 pb-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs mb-3 border border-[#1e3a5f]/20">
          <span>🏠</span><span>クラブハウス</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">クラブハウス</h1>
        <p className="text-slate-400 text-sm mt-1">Osaka Goonies — 選手メニュー</p>
      </div>

      <div className="flex flex-col gap-3">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setSubView(item.id)}
            className="w-full bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex items-center gap-4 text-left active:scale-[0.98] transition-transform hover:shadow-md"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
              style={{ background: `${item.accent}15` }}
            >
              {item.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-slate-900 text-base">{item.title}</p>
              <p className="text-slate-400 text-xs mt-0.5">{item.subtitle}</p>
            </div>
            <ChevronRight size={18} className="text-slate-300 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

function BackBar({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-white/80">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-[#1e3a5f] font-semibold text-sm"
      >
        <ChevronRight size={16} className="rotate-180" />
        <span>クラブハウス</span>
      </button>
      <span className="text-slate-300">|</span>
      <span className="text-slate-500 text-sm">{label}</span>
    </div>
  );
}
