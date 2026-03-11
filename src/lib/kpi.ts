import { PlayerStats } from "@/types";

export interface Mission {
  title: string;
  message: string;
  isSpecial: boolean;
}

export function calculateNextGameMission(stats: PlayerStats): Mission | null {
  if (stats.atBatCount === 0) {
    return {
      title: "🔥 次戦のミッション",
      message: "まずは初打席で初安打を狙おう！",
      isSpecial: false,
    };
  }

  const currentAvg = stats.hits / stats.atBatCount;

  if (currentAvg >= 0.400) {
    return {
      title: "🌟 トッププレイヤーの使命",
      message: "驚異の打率4割超え！首位打者をキープせよ！",
      isSpecial: true,
    };
  }

  const targetAvg = currentAvg < 0.300 ? 0.300 : 0.400;
  const targetStr = targetAvg === 0.300 ? ".300" : ".400";

  // 一般的な草野球の1試合の打数（3打数、4打数を優先して現実的な目標を探す）
  const targetAtBatsList = [3, 4, 5, 2, 1];

  for (const newAtBats of targetAtBatsList) {
    for (let newHits = 1; newHits <= newAtBats; newHits++) {
      const newAvg = (stats.hits + newHits) / (stats.atBatCount + newAtBats);
      // 浮動小数点誤差を少しだけ考慮して判定
      if (newAvg >= targetAvg - 0.000001) {
        return {
          title: "🔥 次戦のミッション",
          message: `打率${targetStr}の大台まで、あと「${newAtBats}打数${newHits}安打」！`,
          isSpecial: false,
        };
      }
    }
  }

  // もし1試合の現実的な範囲で達成不可能な場合
  return {
    title: "🔥 次戦のミッション",
    message: `次の試合は猛打賞で打率${targetStr}に近づこう！`,
    isSpecial: false,
  };
}
