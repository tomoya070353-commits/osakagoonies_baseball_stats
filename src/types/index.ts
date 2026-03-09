// 打球方向
export type HitDirection = "Pull" | "Center" | "Opposite" | "Unknown";

// 打球種類
export type ContactType = "Grounder" | "Fly" | "Liner" | "Unknown";

// 打席結果
export type AtBatResult =
  | "Single"
  | "Double"
  | "Triple"
  | "HomeRun"
  | "Strikeout"
  | "Walk"
  | "HBP"
  | "SacrificeBunt"
  | "SacrificeFly"
  | "FieldersChoice"
  | "Error"
  | "Out";

// 1打席の解析結果
export interface ParsedAtBat {
  raw: string;
  direction: HitDirection;
  contact: ContactType;
  result: AtBatResult;
  isHit: boolean;
  isTotalBase: number; // 塁打数
  isWalkOrHBP: boolean;
  isStrikeout: boolean;
  isOut: boolean; // 四死球以外のアウト
  isSacrificeBunt: boolean;
  isSacrificeFly: boolean;
}

// 1試合の選手打席記録
export interface GameRecord {
  date: string;
  battingOrder: string;
  position: string;
  atBats: ParsedAtBat[];
  rbi: number;
  stolenBases: number;
}

// 選手の集計成績
export interface PlayerStats {
  name: string;
  games: GameRecord[];
  // 基本カウント
  plateAppearances: number; // 打席数
  atBatCount: number; // 打数
  hits: number;
  singles: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  walks: number;
  hbp: number;
  strikeouts: number;
  grounders: number;
  flies: number;
  liners: number;
  pullHits: number;
  centerHits: number;
  oppositeHits: number;
  rbi: number;
  stolenBases: number;
  // 計算指標
  avg: number;
  obp: number;
  slg: number;
  ops: number;
  kRate: number;
  goAo: number;
  // パワプロ指標
  meet: number;    // ミート 0-100
  power: number;   // パワー 0-100
  speed: number;   // 走力 0-100
  eye: number;     // 選球眼 0-100
  clutch: number;  // 勝負強さ 0-100
  trajectory: number; // 弾道 1-4
  // 打順・守備（最頻値）
  mostFrequentPosition: string;
  mostFrequentOrder: string;
}

// パワプロ風レーダーデータ
export interface RadarData {
  subject: string;
  value: number;
  fullMark: number;
}
