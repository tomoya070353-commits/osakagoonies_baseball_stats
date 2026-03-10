"use client";

import type { PlayerStats } from "@/types";
import PlayerHeader from "@/components/PlayerHeader";
import QuickStats from "@/components/QuickStats";
import PlayerRadar from "@/components/PlayerRadar";
import DirectionChart from "@/components/DirectionChart";
import ContactChart from "@/components/ContactChart";

interface PlayerTabProps {
  players: PlayerStats[];
  selected: PlayerStats;
  onSelect: (player: PlayerStats) => void;
}

export default function PlayerTab({ players, selected, onSelect }: PlayerTabProps) {
  return (
    <div className="flex flex-col gap-6 py-2 pb-8">
      {/* 選手名タップ → ドロップダウン（PlayerHeader内） */}
      <PlayerHeader
        player={selected}
        players={players}
        onSelect={onSelect}
      />
      <QuickStats player={selected} />
      <div className="px-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        <PlayerRadar player={selected} />
        <DirectionChart player={selected} />
        <ContactChart player={selected} />
      </div>
      <div className="h-4" />
    </div>
  );
}
