"use client";

import { useState } from "react";
import type { PlayerStats } from "@/types";
import BottomNav from "@/components/BottomNav";
import TeamDashboard from "@/components/TeamDashboard";
import RankingTab from "@/components/RankingTab";
import PlayerTab from "@/components/PlayerTab";
import { BarChart2 } from "lucide-react";

type Tab = "team" | "ranking" | "player";

interface AppClientProps {
  players: PlayerStats[];
}

export default function AppClient({ players }: AppClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("team");
  const [selected, setSelected] = useState<PlayerStats>(players[0]);

  const handleDrillDown = (player: PlayerStats) => {
    setSelected(player);
    setActiveTab("player");
  };

  const TAB_TITLES: Record<Tab, string> = {
    team:    "チームダッシュボード",
    ranking: "ランキング",
    player:  "個人成績",
  };

  return (
    <div className="min-h-dvh bg-slate-50">
      {/* トップナビゲーション */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 bg-white/90 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <BarChart2 size={18} className="text-[#1e3a5f]" />
          <span className="text-sm font-bold text-[#1e3a5f] tracking-tight">
            {TAB_TITLES[activeTab]}
          </span>
        </div>
        <span className="text-slate-400 text-xs">{players.length}名登録中</span>
      </header>

      {/* メインコンテンツ（タブで切り替え） */}
      <main className="pb-20">
        {activeTab === "team" && (
          <TeamDashboard players={players} />
        )}
        {activeTab === "ranking" && (
          <RankingTab players={players} onDrillDown={handleDrillDown} />
        )}
        {activeTab === "player" && (
          <PlayerTab
            players={players}
            selected={selected}
            onSelect={setSelected}
          />
        )}
      </main>

      {/* ボトムナビ */}
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}
