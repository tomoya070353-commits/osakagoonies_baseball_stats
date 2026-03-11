import type { PlayerStats } from "@/types";

type PartialStats = Omit<PlayerStats, "meet" | "power" | "speed" | "eye" | "clutch" | "trajectory" | "hittingStreak" | "onBaseStreak">;

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

  // 【ミート】絶対評価 (AVGベース)
  // A: .360~(80~100) B: .330~(60~79) C: .300~(40~59) D: .250~(20~39) E: .200~(1~19) F: <.200(0)
  let meet = 0;
  if (partial.avg >= 0.360)      meet = 80 + (partial.avg - 0.360) * 500;
  else if (partial.avg >= 0.330) meet = 60 + (partial.avg - 0.330) * (20 / 0.030);
  else if (partial.avg >= 0.300) meet = 40 + (partial.avg - 0.300) * (20 / 0.030);
  else if (partial.avg >= 0.250) meet = 20 + (partial.avg - 0.250) * (20 / 0.050);
  else if (partial.avg >= 0.200) meet = 1  + (partial.avg - 0.200) * (19 / 0.050);
  meet = clamp(meet);

  // 【パワー】絶対評価 (SLGベース)
  // A: .600~(80~100) B: .500~(60~79) C: .450~(40~59) D: .400~(20~39) E: .300~(1~19) F: <.300(0)
  let power = 0;
  if (partial.slg >= 0.600)      power = 80 + (partial.slg - 0.600) * 100;
  else if (partial.slg >= 0.500) power = 60 + (partial.slg - 0.500) * (20 / 0.100);
  else if (partial.slg >= 0.450) power = 40 + (partial.slg - 0.450) * (20 / 0.050);
  else if (partial.slg >= 0.400) power = 20 + (partial.slg - 0.400) * (20 / 0.050);
  else if (partial.slg >= 0.300) power = 1  + (partial.slg - 0.300) * (19 / 0.100);
  power = clamp(power);

  // 【走力】相対評価: 盗塁数 + 三塁打数 + 二塁打数 (チーム内最大値を 100 とする)
  const speedRaw = (p: PartialStats) => p.stolenBases + p.triples + p.doubles;
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
): Omit<PlayerStats, "hittingStreak" | "onBaseStreak">[] {
  return partials.map((partial) => {
    const powerPro = calcPowerProStats(partial, partials);
    return { ...partial, ...powerPro } as Omit<PlayerStats, "hittingStreak" | "onBaseStreak">;
  });
}
