"use client";

import { useEffect, useState } from "react";
import type { PlayerStats } from "@/types";
import { getPlayersData } from "./actions";
import PlayerSheet from "@/components/PlayerSheet";
import PlayerHeader from "@/components/PlayerHeader";
import QuickStats from "@/components/QuickStats";
import PlayerRadar from "@/components/PlayerRadar";
import DirectionChart from "@/components/DirectionChart";
import ContactChart from "@/components/ContactChart";
import { Loader2, BarChart2 } from "lucide-react";

export default function Home() {
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [selected, setSelected] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPlayersData()
      .then((enhanced) => {
        setPlayers(enhanced);
        setSelected(enhanced[0] ?? null);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4">
        <Loader2 size={36} className="text-emerald-400 animate-spin" />
        <p className="text-white/40 text-sm">データを読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-red-400 font-bold">エラー</p>
        <p className="text-white/40 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#080e14] pb-28">
      {/* トップナビゲーション */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 bg-[#080e14]/80 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center gap-2">
          <BarChart2 size={18} className="text-emerald-400" />
          <span className="text-sm font-bold text-white tracking-tight">野球成績ダッシュボード</span>
        </div>
        <span className="text-white/30 text-xs">{players.length}名登録中</span>
      </header>

      {/* メインコンテンツ */}
      {selected ? (
        <main className="flex flex-col gap-6 py-2">
          {/* ヘッダー */}
          <PlayerHeader player={selected} />

          {/* Quick Stats */}
          <QuickStats player={selected} />

          {/* レーダー + チャート グリッド（md以上で2列） */}
          <div className="px-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <PlayerRadar player={selected} />
            <DirectionChart player={selected} />
            <ContactChart player={selected} />
          </div>

          {/* フッターパディング用スペース */}
          <div className="h-4" />
        </main>
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh] text-white/30 gap-2">
          <BarChart2 size={40} />
          <p className="text-sm">下のボタンから選手を選択してください</p>
        </div>
      )}

      {/* ボトムシート（選手選択） */}
      <PlayerSheet
        players={players}
        selectedPlayer={selected}
        onSelect={setSelected}
      />
    </div>
  );
}
