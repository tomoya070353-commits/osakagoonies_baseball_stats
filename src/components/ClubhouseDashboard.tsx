"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { PlayerStats } from "@/types";
import type { PitcherStats, TeamSeasonStats, TeamHistory } from "@/app/actions";
import CompareDashboard from "@/components/CompareDashboard";
import SalaryDashboard from "@/components/SalaryDashboard";
import MilestoneDashboard from "@/components/MilestoneDashboard";
import SwotDashboard from "@/components/SwotDashboard";
import LineupSimulator from "@/components/LineupSimulator"; // Added import for LineupSimulator
import AmidakujiDashboard from "@/components/AmidakujiDashboard"; // Added import for Amidakuji
import { ChevronRight, Shield, Shuffle } from "lucide-react"; // Added Icons

type SubView = null | "compare" | "salary" | "milestone" | "swot" | "lineup" | "amida"; // Updated SubView type

interface ClubhouseDashboardProps {
  players: PlayerStats[];
  pitchers: PitcherStats[];
  teamStats: TeamSeasonStats | null;
  teamHistory: TeamHistory;
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
  {
    id: "swot" as const,
    emoji: "👔",
    title: "グニコンサル診断",
    subtitle: "SWOT分析レポート（お遊び機能）",
    accent: "#0f172a",
  },
];

// ── アニメーション設定 ──────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};
function stagger(i: number) {
  return {
    variants: fadeUp,
    initial: "hidden",
    animate: "visible",
    transition: { duration: 0.4, ease: "easeOut" as const, delay: i * 0.08 }
  };
}



interface MenuCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
  badge?: string;
}

function MenuCard({ title, subtitle, icon, onClick, color, badge }: MenuCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full bg-white border ${color} shadow-sm rounded-2xl p-5 flex items-center gap-4 text-left active:scale-[0.98] transition-transform hover:shadow-md hover:border-[#1e3a5f]`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 bg-slate-50 border border-slate-100`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-black text-slate-900 text-base">{title}</p>
          {badge && (
            <span className="px-2 py-0.5 text-[10px] font-bold text-[#1e3a5f] bg-[#1e3a5f]/10 border border-[#1e3a5f]/20 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <p className="text-slate-400 text-xs mt-0.5">{subtitle}</p>
      </div>
      <ChevronRight size={18} className="text-slate-300 shrink-0" />
    </button>
  );
}

export default function ClubhouseDashboard({ players, pitchers, teamStats, teamHistory }: ClubhouseDashboardProps) {
  const [subView, setSubView] = useState<"compare" | "salary" | "milestone" | "swot" | "lineup" | "amida" | null>(null);

  if (subView === "milestone") {
    return (
      <div>
        <BackBar label="🏆 チームマイルストーン" onBack={() => setSubView(null)} />
        <MilestoneDashboard teamStats={teamStats} pitchers={pitchers} teamHistory={teamHistory} />
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
  if (subView === "swot") {
    return (
      <div>
        <BackBar label="👔 グニコンサル診断" onBack={() => setSubView(null)} />
        <SwotDashboard players={players} />
      </div>
    );
  }

  if (subView === "lineup") {
    return (
      <div className="min-h-screen bg-[#f8f9fa] pb-24">
        <BackBar label="AI打順シミュレーター" onBack={() => setSubView(null)} />
        <LineupSimulator players={players} onBack={() => setSubView(null)} />
      </div>
    );
  }

  if (subView === "amida") {
    return (
      <div className="min-h-screen bg-slate-50 pb-24">
        <BackBar label="運命のあみだくじ" onBack={() => setSubView(null)} />
        <AmidakujiDashboard players={players} onBack={() => setSubView(null)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-5 py-4 pb-8">
      <motion.div {...stagger(0)}>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs mb-3 border border-[#1e3a5f]/20">
          <span>🏠</span><span>クラブハウス</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">クラブハウス</h1>
        <p className="text-slate-400 text-sm mt-1">Osaka Goonies — 選手メニュー</p>
      </motion.div>

      <div className="flex flex-col gap-3">
        {MENU_ITEMS.map((item, i) => (
          <motion.button
            key={item.id}
            {...stagger(i + 1)}
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
          </motion.button>
        ))}

        {/* 下段：新機能グリッド */}
        <div className="flex flex-col gap-3">
          <motion.div {...stagger(MENU_ITEMS.length + 1)}>
            <MenuCard
              title="AIスタメン・打順シミュレーター"
              subtitle="参加メンバーから最適オーダーを自動生成"
              icon={<Shield size={24} className="text-[#1e3a5f]" />}
              onClick={() => setSubView("lineup")}
              color="border-[rgb(30,58,95)]"
              badge="NEW AI機能"
            />
          </motion.div>

          <motion.div {...stagger(MENU_ITEMS.length + 2)}>
            <MenuCard
              title="運命のあみだくじ"
              subtitle="打順や余興を運任せに決めるエンタメ機能"
              icon={<Shuffle size={24} className="text-amber-600" />}
              onClick={() => setSubView("amida")}
              color="border-amber-600"
              badge="お楽しみ"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// MenuCard Component

interface BackBarProps {
  label: string;
  onBack: () => void;
}

function BackBar({ label, onBack }: BackBarProps) {
  return (
    <div className="flex flex-col gap-2 px-5 py-4 border-b border-slate-100 bg-white/80">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold text-sm transition-colors w-fit"
      >
        <ChevronRight size={18} className="rotate-180" />
        <span>クラブハウスに戻る</span>
      </button>
      <div className="pl-6">
        <span className="text-slate-400 text-xs font-bold">{label}</span>
      </div>
    </div>
  );
}
