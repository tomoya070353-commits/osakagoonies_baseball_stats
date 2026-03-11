import type { PlayerStats, GameRecord } from "@/types";

export interface MonthlyLeader {
  name: string;
  value: number;
  label: string;
}

export interface MonthlyAwardsData {
  targetMonth: string; // 例: "2025/05"
  mvp: {
    name: string;
    score: number;
    hits: number;
    homeRuns: number;
    rbi: number;
    avg: number;
  } | null;
  leaders: {
    avg: MonthlyLeader | null;
    homeRuns: MonthlyLeader | null;
    rbi: MonthlyLeader | null;
    stolenBases: MonthlyLeader | null;
  };
}

/**
 * 日付文字列（"YYYY/MM/DD" 等）から "YYYY/MM" を抽出する
 */
function extractMonth(dateStr: string): string | null {
  const parts = dateStr.split(/[-/]/);
  if (parts.length >= 2) {
    // 1桁の月(5など)にゼロ埋めする場合: parts[1].padStart(2, '0')
    const year = parts[0];
    const month = parts[1].padStart(2, "0");
    return `${year}/${month}`;
  }
  return null;
}

export function calculateMonthlyAwards(players: PlayerStats[]): MonthlyAwardsData | null {
  // 1. まず最も新しい「月」を見つける
  let latestMonth = "";
  for (const p of players) {
    for (const g of p.games) {
      const m = extractMonth(g.date);
      if (m && m > latestMonth) {
        latestMonth = m;
      }
    }
  }

  if (!latestMonth) return null; // データなし

  // 2. その月の成績を選手ごとに集計
  interface MonthlyStat {
    name: string;
    atBats: number; // 打数
    plateAppearances: number; // 打席数
    hits: number;
    homeRuns: number;
    rbi: number;
    stolenBases: number;
    walksHbp: number;
  }

  const monthlyStats: MonthlyStat[] = [];

  for (const p of players) {
    let atBats = 0;
    let plateAppearances = 0;
    let hits = 0;
    let homeRuns = 0;
    let rbi = 0;
    let stolenBases = 0;
    let walksHbp = 0;
    
    let hasGameInMonth = false;

    for (const g of p.games) {
      if (extractMonth(g.date) === latestMonth) {
        hasGameInMonth = true;
        rbi += g.rbi || 0;
        stolenBases += g.stolenBases || 0;

        for (const ab of g.atBats) {
          plateAppearances++;
          if (!ab.isWalkOrHBP && !ab.isSacrificeBunt && !ab.isSacrificeFly) {
            atBats++;
          }
          if (ab.isHit) hits++;
          if (ab.result === "HomeRun") homeRuns++;
          if (ab.isWalkOrHBP) walksHbp++;
        }
      }
    }

    if (hasGameInMonth) {
      monthlyStats.push({
        name: p.name,
        atBats,
        plateAppearances,
        hits,
        homeRuns,
        rbi,
        stolenBases,
        walksHbp
      });
    }
  }

  if (monthlyStats.length === 0) return null;

  // 3. MVPスコアの計算と選出
  // スコア: 安打×10 + 打点×5 + 本塁打×30 + 四死球×5
  let mvp = null;
  let maxScore = -1;

  for (const st of monthlyStats) {
    const score = st.hits * 10 + st.rbi * 5 + st.homeRuns * 30 + st.walksHbp * 5;
    if (score > maxScore) {
      maxScore = score;
      const avg = st.atBats > 0 ? st.hits / st.atBats : 0;
      mvp = {
        name: st.name,
        score,
        hits: st.hits,
        homeRuns: st.homeRuns,
        rbi: st.rbi,
        avg
      };
    }
  }

  // 4. リーダーズの抽出 (打率、本塁打、打点、盗塁)
  const leaders = {
    avg: null as MonthlyLeader | null,
    homeRuns: null as MonthlyLeader | null,
    rbi: null as MonthlyLeader | null,
    stolenBases: null as MonthlyLeader | null,
  };

  // 打率 (一定打数以上の選手から選出。例として3打数以上とする)
  const avgCandidates = monthlyStats.filter(s => s.atBats >= 3);
  if (avgCandidates.length > 0) {
    const topAvgStats = avgCandidates.reduce((prev, current) => {
      const pAvg = prev.atBats > 0 ? prev.hits / prev.atBats : 0;
      const cAvg = current.atBats > 0 ? current.hits / current.atBats : 0;
      return pAvg > cAvg ? prev : current;
    });
    leaders.avg = {
      name: topAvgStats.name,
      value: topAvgStats.hits / topAvgStats.atBats,
      label: (topAvgStats.hits / topAvgStats.atBats).toFixed(3).replace(/^0/, ""),
    };
  }

  // 本塁打 (0本より多い選手のみ)
  const hrCandidates = monthlyStats.filter(s => s.homeRuns > 0);
  if (hrCandidates.length > 0) {
    const topHr = hrCandidates.reduce((a, b) => a.homeRuns > b.homeRuns ? a : b);
    leaders.homeRuns = { name: topHr.name, value: topHr.homeRuns, label: `${topHr.homeRuns}本` };
  }

  // 打点 (0打点より多い選手のみ)
  const rbiCandidates = monthlyStats.filter(s => s.rbi > 0);
  if (rbiCandidates.length > 0) {
    const topRbi = rbiCandidates.reduce((a, b) => a.rbi > b.rbi ? a : b);
    leaders.rbi = { name: topRbi.name, value: topRbi.rbi, label: `${topRbi.rbi}打点` };
  }

  // 盗塁 (0盗塁より多い選手のみ)
  const sbCandidates = monthlyStats.filter(s => s.stolenBases > 0);
  if (sbCandidates.length > 0) {
    const topSb = sbCandidates.reduce((a, b) => a.stolenBases > b.stolenBases ? a : b);
    leaders.stolenBases = { name: topSb.name, value: topSb.stolenBases, label: `${topSb.stolenBases}盗塁` };
  }


  return {
    targetMonth: latestMonth,
    mvp,
    leaders
  };
}
