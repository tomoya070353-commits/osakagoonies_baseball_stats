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
  const all = await getAllTeamStats();
  return all.find((r) => r.year === year) ?? null;
}

export async function getAllTeamStats(): Promise<TeamSeasonStats[]> {
  const res  = await fetch(TEAM_CSV_URL, { next: { revalidate: 3600 } });
  const text = await res.text();

  const rows   = text.trim().split(/\r?\n/);
  const header = rows[0].split(",");
  const col    = (name: string) => header.indexOf(name);

  const results: TeamSeasonStats[] = [];

  for (const row of rows.slice(1)) {
    const cells = row.split(",");
    const year  = cells[col("年度")]?.trim();
    if (!year || isNaN(Number(year))) continue;

    results.push({
      year,
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
    });
  }

  return results;
}

export interface RecordHolder {
  value: number;
  year: string;
}

export interface TeamHistory {
  current:    TeamSeasonStats | null;
  lastYear:   TeamSeasonStats | null;
  record:     TeamSeasonStats | null;
  allTime:    { wins: number; runs: number; homeRuns: number; stolenBases: number };
  recordHolders: {
    wins:        RecordHolder;
    runs:        RecordHolder;
    homeRuns:    RecordHolder;
    stolenBases: RecordHolder;
  };
}

export async function getTeamHistory(): Promise<TeamHistory> {
  const all      = await getAllTeamStats();
  const current  = all.find((r) => r.year === "2026") ?? null;
  const lastYear = all.find((r) => r.year === "2025") ?? null;

  // 各項目の歴代最高値と年度
  function bestOf(key: keyof TeamSeasonStats): RecordHolder {
    let best: TeamSeasonStats | null = null;
    for (const r of all) {
      if (!best || (r[key] as number) > (best[key] as number)) best = r;
    }
    return { value: best ? (best[key] as number) : 0, year: best?.year ?? "-" };
  }

  const recordHolders = {
    wins:        bestOf("wins"),
    runs:        bestOf("runs"),
    homeRuns:    bestOf("homeRuns"),
    stolenBases: bestOf("stolenBases"),
  };

  const allTime = {
    wins:        recordHolders.wins.value,
    runs:        recordHolders.runs.value,
    homeRuns:    recordHolders.homeRuns.value,
    stolenBases: recordHolders.stolenBases.value,
  };

  const record = all.reduce<TeamSeasonStats | null>((best, r) => {
    if (!best || r.runs > best.runs) return r;
    return best;
  }, null);

  return { current, lastYear, record, allTime, recordHolders };
}



// ── 投手成績 ──────────────────────────────────────────────────
export interface PitcherStats {
  number: string;
  name: string;
  games: number;
  wins: number;
  losses: number;
  saves: number;
  winRate: number;
  era: number;
  innings: string;      // 例: "11回", "5回2/3"
  runsAllowed: number;
  earnedRuns: number;
  completeGames: number;
  shutouts: number;
  hitsAllowed: number;
  homeRunsAllowed: number;
  strikeouts: number;
  walksHBP: number;
}

const PITCHING_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRMhlYtPBRM_4PMS6d8_UjP0n_OfFS9YzJWzvc6XdPAthLaCGt17A1bsUAqjPSKj8S9NTL8up8ZZea2/pub?gid=1072669241&single=true&output=csv";

export async function getPitchingData(): Promise<PitcherStats[]> {
  const res = await fetch(PITCHING_CSV_URL, { next: { revalidate: 3600 } });
  const text = await res.text();

  const rows = text.trim().split(/\r?\n/);
  const header = rows[0].split(",");
  const col = (name: string) => header.indexOf(name);

  const results: PitcherStats[] = [];

  for (const row of rows.slice(1)) {
    const cells = row.split(",");
    const games = Number(cells[col("試合数")]);
    if (games < 1) continue;
    if (!cells[col("選手名")]?.trim()) continue;

    results.push({
      number:           cells[col("#")] ?? "",
      name:             cells[col("選手名")].trim(),
      games,
      wins:             Number(cells[col("勝")]),
      losses:           Number(cells[col("敗")]),
      saves:            Number(cells[col("セーブ")]),
      winRate:          Number(cells[col("勝率")]),
      era:              Number(cells[col("防御率")]),
      innings:          cells[col("投球回")] ?? "",
      runsAllowed:      Number(cells[col("失点")]),
      earnedRuns:       Number(cells[col("自責点")]),
      completeGames:    Number(cells[col("完投")]),
      shutouts:         Number(cells[col("完封")]),
      hitsAllowed:      Number(cells[col("被安打")]),
      homeRunsAllowed:  Number(cells[col("被本塁打")]),
      strikeouts:       Number(cells[col("奪三振")]),
      walksHBP:         Number(cells[col("与四死球")]),
    });
  }

  return results;
}
