import type { PlayerStats } from "@/types";

type PartialStats = Omit<PlayerStats, "meet" | "power" | "speed" | "eye" | "clutch" | "trajectory">;

/**
 * 0〜100 にクランプ
 */
function clamp(val: number): number {
  return Math.max(0, Math.min(100, Math.round(val)));
}

/**
 * チーム全員の最大値を基準に 0〜100 スケールへ変換する
 * (固定閾値ベース) — 草野球レベルに合わせた閾値を設定
 */
export function calcPowerProStats(
  partial: PartialStats,
  allPlayers: PartialStats[]
): Pick<PlayerStats, "meet" | "power" | "speed" | "eye" | "clutch" | "trajectory"> {
  // チーム最大値を取得する helper
  const teamMax = (fn: (p: PartialStats) => number) =>
    Math.max(...allPlayers.map(fn), 1);

  // ミート: AVG (チーム内最大値を 100 とする)
  const maxAvg = teamMax((p) => p.avg);
  const meet = clamp((partial.avg / maxAvg) * 100);

  // パワー: SLG (チーム内最大値を 100 とする)
  const maxSlg = teamMax((p) => p.slg);
  const power = clamp((partial.slg / maxSlg) * 100);

  // 走力: 盗塁数 + 三塁打数 (チーム内最大値を 100 とする)
  const speedRaw = (p: PartialStats) => p.stolenBases + p.triples;
  const maxSpeed = teamMax(speedRaw);
  const speed = clamp((speedRaw(partial) / maxSpeed) * 100);

  // 選球眼: 四死球 / 打席数
  const eyeRaw = (p: PartialStats) =>
    p.plateAppearances > 0 ? (p.walks + p.hbp) / p.plateAppearances : 0;
  const maxEye = teamMax(eyeRaw);
  const eye = clamp((eyeRaw(partial) / maxEye) * 100);

  // 勝負強さ: 打点 / 打席数
  const clutchRaw = (p: PartialStats) =>
    p.plateAppearances > 0 ? p.rbi / p.plateAppearances : 0;
  const maxClutch = teamMax(clutchRaw);
  const clutch = clamp((clutchRaw(partial) / maxClutch) * 100);

  // 弾道: フライ率に基づき 1〜4 段階
  const total = partial.grounders + partial.flies + partial.liners;
  const flyRate = total > 0 ? partial.flies / total : 0;
  let trajectory: number;
  if (flyRate < 0.25) trajectory = 1;       // ゴロ打者
  else if (flyRate < 0.45) trajectory = 2;  // 中間
  else if (flyRate < 0.65) trajectory = 3;  // フライ打者
  else trajectory = 4;                       // 大型フライ打者

  return { meet, power, speed, eye, clutch, trajectory };
}

/**
 * 全選手データに対してパワプロ指標を付与して PlayerStats を完成させる
 */
export function enhanceAllPlayers(
  partials: PartialStats[]
): PlayerStats[] {
  return partials.map((partial) => {
    const powerPro = calcPowerProStats(partial, partials);
    return { ...partial, ...powerPro } as PlayerStats;
  });
}
