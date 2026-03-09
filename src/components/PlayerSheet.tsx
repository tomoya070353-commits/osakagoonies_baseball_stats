"use client";

import { Drawer } from "vaul";
import type { PlayerStats } from "@/types";
import { Users, ChevronRight } from "lucide-react";

interface PlayerSheetProps {
  players: PlayerStats[];
  selectedPlayer: PlayerStats | null;
  onSelect: (player: PlayerStats) => void;
}

export default function PlayerSheet({ players, selectedPlayer, onSelect }: PlayerSheetProps) {
  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        <button className="fixed bottom-6 left-0 right-0 mx-auto w-[calc(100%-2rem)] max-w-sm z-50 flex items-center justify-between px-5 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold shadow-2xl shadow-emerald-900/50 active:scale-95 transition-transform">
          <div className="flex items-center gap-2">
            <Users size={20} />
            <span className="text-base">選手を選択</span>
          </div>
          <span className="text-sm font-normal opacity-80 truncate max-w-[160px]">
            {selectedPlayer ? selectedPlayer.name : "未選択"}
          </span>
        </button>
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 outline-none">
          <div className="bg-[#0f1923] rounded-t-3xl border-t border-white/10 max-h-[80vh] overflow-hidden flex flex-col">
            {/* ハンドル */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1.5 rounded-full bg-white/20" />
            </div>

            {/* タイトル */}
            <div className="px-5 py-3 border-b border-white/10">
              <Drawer.Title className="text-white font-bold text-lg">
                選手一覧
              </Drawer.Title>
              <p className="text-white/40 text-xs mt-0.5">{players.length}名</p>
            </div>

            {/* 選手リスト */}
            <div className="overflow-y-auto flex-1 py-2">
              {players.map((player) => {
                const isSelected = selectedPlayer?.name === player.name;
                return (
                  <Drawer.Close
                    key={player.name}
                    asChild
                  >
                    <button
                      onClick={() => onSelect(player)}
                      className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors active:bg-white/5 ${
                        isSelected ? "bg-emerald-500/15" : "hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* アバター */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          isSelected
                            ? "bg-emerald-500 text-white"
                            : "bg-white/10 text-white/60"
                        }`}>
                          {player.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <p className={`font-semibold ${isSelected ? "text-emerald-400" : "text-white"}`}>
                            {player.name}
                          </p>
                          <p className="text-white/40 text-xs">
                            {player.mostFrequentPosition} | {player.games.length}試合
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-white/60 text-sm font-mono">
                          {player.avg.toFixed(3)}
                        </span>
                        <ChevronRight
                          size={16}
                          className={isSelected ? "text-emerald-400" : "text-white/20"}
                        />
                      </div>
                    </button>
                  </Drawer.Close>
                );
              })}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
