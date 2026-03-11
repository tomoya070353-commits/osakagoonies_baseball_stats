export interface PlayerStreak {
  name: string;
  hittingStreak: number;
  onBaseStreak: number;
}

const STREAK_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRMhlYtPBRM_4PMS6d8_UjP0n_OfFS9YzJWzvc6XdPAthLaCGt17A1bsUAqjPSKj8S9NTL8up8ZZea2/pub?gid=207471771&single=true&output=csv";

export async function fetchAndCalculateStreaks(): Promise<Map<string, PlayerStreak>> {
  const res = await fetch(STREAK_CSV_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("ストリークデータの取得に失敗しました");
  const text = await res.text();

  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length < 2) return new Map();

  const headers = lines[0].split(",");
  const col = (name: string) => headers.indexOf(name);

  // 1. Parse and group by player
  interface RawGameLog {
    date: string;
    atBats: number;
    hits: number;
    walksHbp: number;
  }
  const playerLogs = new Map<string, RawGameLog[]>();

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(",");
    const name = row[col("選手名")]?.trim();
    if (!name) continue;

    const atBats = Number(row[col("打数")]) || 0;
    const hits = Number(row[col("安打")]) || 0;
    // 四死球列は "四死球" と仮定
    const walksHbp = Number(row[col("四死球")]) || 0;
    const date = row[col("試合日")]?.trim() || "";

    if (!playerLogs.has(name)) {
      playerLogs.set(name, []);
    }
    playerLogs.get(name)!.push({ date, atBats, hits, walksHbp });
  }

  // 2. Calculate streaks for each player
  const result = new Map<string, PlayerStreak>();

  for (const [name, logs] of playerLogs.entries()) {
    // 試合日で降順ソート (最新が先頭)
    const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));

    let hittingStreak = 0;
    let onBaseStreak = 0;
    let hittingEnded = false;
    let onBaseEnded = false;

    for (const log of sortedLogs) {
      if (hittingEnded && onBaseEnded) break;

      // --- 連続安打の判定 ---
      if (!hittingEnded) {
        if (log.hits > 0) {
          hittingStreak++;
        } else if (log.hits === 0 && log.atBats === 0) {
          // 四死球・犠打のみの場合は継続 (カウントは増やさないが終了もしない)
        } else if (log.hits === 0 && log.atBats > 0) {
          hittingEnded = true;
        }
      }

      // --- 連続出塁の判定 ---
      if (!onBaseEnded) {
        if (log.hits + log.walksHbp > 0) {
          onBaseStreak++;
        } else {
          // 四死球も安打もない場合は即終了
          onBaseEnded = true;
        }
      }
    }

    result.set(name, {
      name,
      hittingStreak,
      onBaseStreak,
    });
  }

  return result;
}
