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

// ── チーム成績（年度別） ──────────────────────────────────────
export interface TeamSeasonStats {
  year: string;
  games: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  runs: number;
  runsAllowed: number;
  avg: number;
  homeRuns: number;
  stolenBases: number;
  era: number;
}

const TEAM_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRMhlYtPBRM_4PMS6d8_UjP0n_OfFS9YzJWzvc6XdPAthLaCGt17A1bsUAqjPSKj8S9NTL8up8ZZea2/pub?gid=1875585265&single=true&output=csv";

export async function getTeamStats(year = "2026"): Promise<TeamSeasonStats | null> {
  const res = await fetch(TEAM_CSV_URL, { next: { revalidate: 3600 } });
  const text = await res.text();

  const rows = text.trim().split(/\r?\n/);
  const header = rows[0].split(",");

  const col = (name: string) => header.indexOf(name);

  for (const row of rows.slice(1)) {
    const cells = row.split(",");
    if (cells[col("年度")] !== year) continue;

    return {
      year:         cells[col("年度")],
      games:        Number(cells[col("試合数")]),
      wins:         Number(cells[col("勝ち")]),
      losses:       Number(cells[col("負け")]),
      draws:        Number(cells[col("引分")]),
      winRate:      Number(cells[col("勝率")]),
      runs:         Number(cells[col("得点")]),
      runsAllowed:  Number(cells[col("失点")]),
      avg:          Number(cells[col("打率")]),
      homeRuns:     Number(cells[col("本塁打")]),
      stolenBases:  Number(cells[col("盗塁")]),
      era:          Number(cells[col("防御率")]),
    };
  }

  return null;
}
