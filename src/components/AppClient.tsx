"use client";

import { useState } from "react";
import type { PlayerStats } from "@/types";
import type { TeamSeasonStats, PitcherStats, TeamHistory } from "@/app/actions";
import BottomNav from "@/components/BottomNav";
import TeamDashboard from "@/components/TeamDashboard";
import RankingTab from "@/components/RankingTab";
import PlayerTab from "@/components/PlayerTab";
import ClubhouseDashboard from "@/components/ClubhouseDashboard";
import { BarChart2 } from "lucide-react";

type Tab = "team" | "ranking" | "player" | "clubhouse";

interface AppClientProps {
  players: PlayerStats[];
  teamStats: TeamSeasonStats | null;
  pitchers: PitcherStats[];
  teamHistory: TeamHistory;
}

export default function AppClient({ players, teamStats, pitchers, teamHistory }: AppClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("team");
  const [selected, setSelected] = useState<PlayerStats>(players[0]);

  const handleDrillDown = (player: PlayerStats) => {
    setSelected(player);
    setActiveTab("player");
  };

  const TAB_TITLES: Record<Tab, string> = {
    team:      "チームダッシュボード",
    ranking:   "ランキング",
    player:    "個人成績",
    clubhouse: "クラブハウス",
  };

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 bg-white/90 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <BarChart2 size={18} className="text-[#1e3a5f]" />
          <span className="text-sm font-bold text-[#1e3a5f] tracking-tight">
            {TAB_TITLES[activeTab]}
          </span>
        </div>
        <span className="text-slate-400 text-xs">{players.length}名登録中</span>
      </header>

      <main className="pb-20">
        {activeTab === "team" && (
          <TeamDashboard players={players} teamStats={teamStats} />
        )}
        {activeTab === "ranking" && (
          <RankingTab players={players} onDrillDown={handleDrillDown} />
        )}
        {activeTab === "player" && (
          <PlayerTab
            players={players}
            selected={selected}
            onSelect={setSelected}
            pitchers={pitchers}
          />
        )}
        {activeTab === "clubhouse" && (
          <ClubhouseDashboard players={players} pitchers={pitchers} teamStats={teamStats} teamHistory={teamHistory} />
        )}
      </main>

      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}
