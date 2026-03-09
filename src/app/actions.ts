"use server";

import { loadPlayerData, aggregatePlayer } from "@/lib/csv-parser";
import { enhanceAllPlayers } from "@/lib/powerpro";
import type { PlayerStats } from "@/types";

export async function getPlayersData(): Promise<PlayerStats[]> {
  // 1. スプレッドシート（CSV URL）からデータを取得・パース
  const playerMap = await loadPlayerData();

  // 2. 各選手の成績を集計
  const partials = Array.from(playerMap.entries()).map(([name, games]) =>
    aggregatePlayer(name, games)
  );

  // 3. パワプロ指標を付与して補完
  const enhanced = enhanceAllPlayers(partials);

  // 4. 打率降順でソート
  enhanced.sort((a, b) => b.avg - a.avg);

  return enhanced;
}
