import { PlayerStats } from "@/types";

export type StatCategory = "rbi" | "hits" | "stolenBases" | "homeRuns" | "avg" | "ops";

export interface RivalMatchup {
  playerA: PlayerStats;
  playerB: PlayerStats;
  category: StatCategory;
  categoryLabel: string;
  valueA: string | number;
  valueB: string | number;
  headline: string;
}

// 比較する指標のリスト
const CATEGORIES: { id: StatCategory; label: string; isFloat: boolean }[] = [
  { id: "rbi", label: "打点", isFloat: false },
  { id: "hits", label: "安打数", isFloat: false },
  { id: "stolenBases", label: "盗塁数", isFloat: false },
  { id: "homeRuns", label: "本塁打", isFloat: false },
  { id: "avg", label: "打率", isFloat: true },
  { id: "ops", label: "OPS", isFloat: true },
];

export function getWeeklyRivalMatchup(players: PlayerStats[]): RivalMatchup | null {
  // 打席数が規定以上の選手（例: 3打席以上）を対象とする
  const validPlayers = players.filter((p) => p.plateAppearances >= 3);
  
  if (validPlayers.length < 2) return null;

  // 日付（日）をシードにして、日替わりで指標を選ぶ
  const dayOfYear = Math.floor(
    (new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      1000 / 60 / 60 / 24
  );
  const selectedCategoryIndex = dayOfYear % CATEGORIES.length;
  const category = CATEGORIES[selectedCategoryIndex];

  // 対象指標でソート（降順）
  const sorted = [...validPlayers].sort((a, b) => {
    const valA = a[category.id] as number;
    const valB = b[category.id] as number;
    return valB - valA;
  });

  // 上位陣（上位10名、または全体）から最も差が小さいペアを探す
  const checkLimit = Math.min(10, sorted.length);
  const topPlayers = sorted.slice(0, checkLimit);

  let bestPair: { p1: PlayerStats; p2: PlayerStats; diff: number; rank: number } | null = null;
  let minDiff = Infinity;

  for (let i = 0; i < topPlayers.length - 1; i++) {
    const p1 = topPlayers[i];
    const p2 = topPlayers[i + 1];
    const v1 = p1[category.id] as number;
    const v2 = p2[category.id] as number;
    
    // 両者とも0の場合はライバル対決として不適切なのでスキップ
    if (v1 === 0 && v2 === 0) continue;

    const diff = Math.abs(v1 - v2);
    
    // 完全に同じ値の場合は優先度を少し下げるか、または微差（diff > 0）を優先する
    // 今回は「最も数値が近くて熱い」ペアを選びたいので、小さな差分を評価する
    // ただし、全く同じ値の場合は「同率争い」になるため許容する
    
    // より接戦（diffが小さい）を優先。同じdiffなら上位（iが小さい）を優先。
    if (diff < minDiff) {
      minDiff = diff;
      bestPair = { p1, p2, diff, rank: i + 1 };
    }
  }

  if (!bestPair) return null;

  // 値のフォーマット
  const formatValue = (val: number, isFloat: boolean) => 
    isFloat ? val.toFixed(3).replace(/^0\./, ".") : val.toString();

  const headline = minDiff === 0
    ? `${category.label}${bestPair.rank}位タイの首位争い！`
    : `熱き${category.label}${bestPair.rank}位争い！`;

  // 左右はランダムに配置するか、一応順位通りにするか。今回は順位通りAが上位とする。
  return {
    playerA: bestPair.p1,
    playerB: bestPair.p2,
    category: category.id,
    categoryLabel: category.label,
    valueA: formatValue(bestPair.p1[category.id] as number, category.isFloat),
    valueB: formatValue(bestPair.p2[category.id] as number, category.isFloat),
    headline,
  };
}
