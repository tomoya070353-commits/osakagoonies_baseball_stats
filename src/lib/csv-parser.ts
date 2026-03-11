import type { GameRecord, PlayerStats } from "@/types";
import { parseAtBat } from "@/lib/parse-ab";

const AT_BAT_COLUMNS = [
  "第一打席", "第二打席", "第三打席", "第四打席", "第五打席",
  "第六打席", "第七打席", "第八打席", "第九打席", "第十打席",
];

/**
 * CSVテキストを行・カラムに分割するシンプルなパーサー
 */
function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h.trim()] = (values[i] ?? "").trim();
    });
    return row;
  });
}

/**
 * data.csv を fetch してパース、選手名でグループ化した GameRecord の Map を返す
 */
export async function loadPlayerData(): Promise<Map<string, GameRecord[]>> {
  const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRMhlYtPBRM_4PMS6d8_UjP0n_OfFS9YzJWzvc6XdPAthLaCGt17A1bsUAqjPSKj8S9NTL8up8ZZea2/pub?gid=828060378&single=true&output=csv";
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("データの取得に失敗しました");
  const text = await res.text();
  const rows = parseCsv(text);

  const playerMap = new Map<string, GameRecord[]>();

  for (const row of rows) {
    const name = row["名前"];
    if (!name) continue;

    const atBatStrings = AT_BAT_COLUMNS.map((col) => row[col] ?? "").filter(Boolean);
    const parsedAtBats = atBatStrings.map(parseAtBat).filter(
      (ab): ab is NonNullable<typeof ab> => ab !== null
    );

    // デバッグ用ログ追加（助っ人1）
    // if (name === "助っ人1") {
    //   console.log(`\n=== 助っ人1 デバッグ: ${row["試合日"] ?? "日付なし"} ===`);
    //   parsedAtBats.forEach((ab) => {
    //     const isAB = !ab.isSacrificeBunt && !ab.isSacrificeFly && !ab.isWalkOrHBP;
    //     console.log(`[生データ: ${ab.raw}]`);
    //     console.log(`  -> 結果: ${ab.result} (安打: ${ab.isHit}, 四死球: ${ab.isWalkOrHBP}, 犠打飛: ${ab.isSacrificeBunt || ab.isSacrificeFly})`);
    //     console.log(`  -> 打球: 方向=${ab.direction}, 性質=${ab.contact}`);
    //     console.log(`  -> 打数にカウントされるか: ${isAB}`);
    //   });
    // }

    const record: GameRecord = {
      date: row["試合日"] ?? "",
      battingOrder: row["打順"] ?? "",
      position: row["守備位置"] ?? "",
      atBats: parsedAtBats,
      rbi: parseInt(row["打点"] ?? "0", 10) || 0,
      stolenBases: parseInt(row["盗塁"] ?? "0", 10) || 0,
    };

    if (!playerMap.has(name)) playerMap.set(name, []);
    playerMap.get(name)!.push(record);
  }

  return playerMap;
}

/**
 * 最頻値を返すユーティリティ
 */
function mostFrequent(arr: string[]): string {
  if (arr.length === 0) return "-";
  const freq: Record<string, number> = {};
  arr.forEach((v) => (freq[v] = (freq[v] ?? 0) + 1));
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
}

/**
 * PlayerStats を計算する（パワプロ指標はstats.ts側で上書き）
 */
export function aggregatePlayer(name: string, games: GameRecord[]): Omit<PlayerStats, "meet" | "power" | "speed" | "eye" | "clutch" | "trajectory" | "hittingStreak" | "onBaseStreak"> {
  let plateAppearances = 0;
  let atBatCount = 0;
  let hits = 0, singles = 0, doubles = 0, triples = 0, homeRuns = 0;
  let walks = 0, hbp = 0, strikeouts = 0;
  let grounders = 0, flies = 0, liners = 0;
  let pullHits = 0, centerHits = 0, oppositeHits = 0;
  let rbi = 0, stolenBases = 0;
  let sacFlies = 0;

  for (const game of games) {
    rbi += game.rbi;
    stolenBases += game.stolenBases;

    for (const ab of game.atBats) {
      plateAppearances++;
      // 打数（atBatCount）には、犠打・犠飛・四死球は含まれない
      if (!ab.isSacrificeBunt && !ab.isSacrificeFly && !ab.isWalkOrHBP) {
        atBatCount++;
      }

      if (ab.isHit) {
        hits++;
        if (ab.result === "Single") singles++;
        else if (ab.result === "Double") doubles++;
        else if (ab.result === "Triple") triples++;
        else if (ab.result === "HomeRun") homeRuns++;
      }
      if (ab.result === "Walk") walks++;
      if (ab.result === "HBP") hbp++;
      if (ab.isStrikeout) strikeouts++;
      if (ab.contact === "Grounder") grounders++;
      if (ab.contact === "Fly") flies++;
      if (ab.contact === "Liner") liners++;
      if (ab.direction === "Pull") pullHits++;
      if (ab.direction === "Center") centerHits++;
      if (ab.direction === "Opposite") oppositeHits++;
      if (ab.isSacrificeFly) sacFlies++;
    }
  }

  const avg = atBatCount > 0 ? hits / atBatCount : 0;
  const obpDenominator = atBatCount + walks + hbp + sacFlies;
  const obp = obpDenominator > 0 ? (hits + walks + hbp) / obpDenominator : 0;
  const totalBases = singles + doubles * 2 + triples * 3 + homeRuns * 4;
  const slg = atBatCount > 0 ? totalBases / atBatCount : 0;
  const ops = obp + slg;
  const kRate = plateAppearances > 0 ? strikeouts / plateAppearances : 0;
  const goAo = flies > 0 ? grounders / flies : grounders > 0 ? Infinity : 0;

  const positions = games.map((g) => g.position).filter(Boolean);
  const orders = games.map((g) => g.battingOrder).filter(Boolean);

  return {
    name,
    games,
    plateAppearances,
    atBatCount,
    hits,
    singles,
    doubles,
    triples,
    homeRuns,
    walks,
    hbp,
    strikeouts,
    grounders,
    flies,
    liners,
    pullHits,
    centerHits,
    oppositeHits,
    rbi,
    stolenBases,
    avg,
    obp,
    slg,
    ops,
    kRate,
    goAo,
    mostFrequentPosition: mostFrequent(positions),
    mostFrequentOrder: mostFrequent(orders),
  };
}
