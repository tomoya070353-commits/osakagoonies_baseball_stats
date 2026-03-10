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
        <button className="fixed bottom-6 left-0 right-0 mx-auto w-[calc(100%-2rem)] max-w-sm z-50 flex items-center justify-between px-5 py-4 rounded-2xl bg-gradient-to-r from-[#1e3a5f] to-[#2a5298] text-white font-bold shadow-2xl shadow-[#1e3a5f]/30 active:scale-95 transition-transform">
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
        <Drawer.Overlay className="fixed inset-0 bg-black/30 z-40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 outline-none">
          <div className="bg-white rounded-t-3xl border-t border-slate-200 max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            {/* ハンドル */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1.5 rounded-full bg-slate-300" />
            </div>

            {/* タイトル */}
            <div className="px-5 py-3 border-b border-slate-100">
              <Drawer.Title className="text-slate-900 font-bold text-lg">
                選手一覧
              </Drawer.Title>
              <p className="text-slate-400 text-xs mt-0.5">{players.length}名</p>
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
                      className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors active:bg-slate-50 ${
                        isSelected ? "bg-[#1e3a5f]/8" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* アバター */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          isSelected
                            ? "bg-[#1e3a5f] text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}>
                          {player.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <p className={`font-semibold ${isSelected ? "text-[#1e3a5f]" : "text-slate-800"}`}>
                            {player.name}
                          </p>
                          <p className="text-slate-400 text-xs">
                            {player.mostFrequentPosition} | {player.games.length}試合
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 text-sm font-mono">
                          {player.avg.toFixed(3)}
                        </span>
                        <ChevronRight
                          size={16}
                          className={isSelected ? "text-[#1e3a5f]" : "text-slate-300"}
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
