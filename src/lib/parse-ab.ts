import type { ParsedAtBat, HitDirection, ContactType, AtBatResult } from "@/types";

/**
 * 打球方向判定（SPEC.md §3.2 ルール1）
 * 1文字目で判定
 */
function parseDirection(raw: string): HitDirection {
  const first = raw.charAt(0);
  if (["左", "三", "遊"].includes(first)) return "Pull";
  if (["中", "二", "投"].includes(first)) return "Center";
  if (["右", "一", "捕"].includes(first)) return "Opposite";
  return "Unknown";
}

/**
 * 打球種類判定（SPEC.md §3.2 ルール2）
 */
function parseContact(raw: string): ContactType {
  if (raw.includes("ゴ")) return "Grounder";
  if (raw.includes("飛") || raw.includes("邪飛")) return "Fly";
  if (raw.includes("直")) return "Liner";
  return "Unknown";
}

/**
 * 打席結果判定（SPEC.md §3.2 ルール3）
 * 安打 / 三振 / 四死球 / 犠打 / 犠飛 / その他アウト
 */
function parseResult(raw: string): AtBatResult {
  // 犠打
  if (raw === "犠打") return "SacrificeBunt";
  // 犠飛
  if (raw.includes("犠飛")) return "SacrificeFly";
  // 四球
  if (raw.startsWith("四") || raw === "四球") return "Walk";
  // 死球
  if (raw.startsWith("死") || raw === "死球") return "HBP";
  // 本塁打（走本 = ランニングホームランも含む）
  if (raw.includes("本") || raw === "走本") return "HomeRun";
  // 三塁打
  if (raw.includes("3")) return "Triple";
  // 二塁打（左2, 中2, 右2, ニ2 など）
  if (raw.includes("2")) return "Double";
  // 安打（末尾「安」または「安」を含む）
  if (raw.includes("安")) return "Single";
  // 三振（空三振 / 三振 / 見三振 など）
  if (raw.includes("振")) return "Strikeout";
  // 敵失・投失・三失 = エラー出塁 → 出塁はするが安打ではない
  if (raw.includes("失")) return "Error";
  return "Out";
}

/**
 * 打席文字列を解析して ParsedAtBat を返す
 */
export function parseAtBat(raw: string): ParsedAtBat | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const result = parseResult(trimmed);
  const direction = parseDirection(trimmed);
  const contact = parseContact(trimmed);

  const isHit = ["Single", "Double", "Triple", "HomeRun"].includes(result);
  const isTotalBase =
    result === "Single"
      ? 1
      : result === "Double"
      ? 2
      : result === "Triple"
      ? 3
      : result === "HomeRun"
      ? 4
      : 0;
  const isWalkOrHBP = result === "Walk" || result === "HBP";
  const isStrikeout = result === "Strikeout";
  const isSacrificeBunt = result === "SacrificeBunt";
  const isSacrificeFly = result === "SacrificeFly";
  // 正式な「アウト」（四死球・犠打・犠飛・安打・エラー以外）
  const isOut = !isHit && !isWalkOrHBP && !isSacrificeBunt && !isSacrificeFly && result !== "Error";

  return {
    raw: trimmed,
    direction,
    contact,
    result,
    isHit,
    isTotalBase,
    isWalkOrHBP,
    isStrikeout,
    isOut,
    isSacrificeBunt,
    isSacrificeFly,
  };
}
