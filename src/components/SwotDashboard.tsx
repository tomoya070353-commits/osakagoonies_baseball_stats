"use client";

import { useState } from "react";
import type { PlayerStats } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

interface SwotDashboardProps {
  players: PlayerStats[];
}

// ── SWOT分析ロジック ──────────────────────────────────────────
function getSwot(p: PlayerStats): {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
} {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const opportunities: string[] = [];
  const threats: string[] = [];

  // ── Strengths ──
  if (p.avg >= 0.3) {
    strengths.push(
      "コアコンピタンスであるコンタクト能力が競合選手に対し競争優位性を確立。打率という主要KPIにおいて業界水準を上回るアウトプットを継続的に創出している。"
    );
  }
  if (p.ops >= 0.9) {
    strengths.push(
      "OPS（出塁率＋長打率）の高ROIがチームの攻撃ポートフォリオ全体のバリュードライバーとして機能。攻撃的KPI群において複合的な付加価値を創出するストラテジック・アセット。"
    );
  }
  if (p.stolenBases >= 5) {
    strengths.push(
      "機動力という差別化ケイパビリティが相手バッテリーへの心理的プレッシャーを継続創出。盗塁成功というクイックウィンの積み重ねにより、塁上オプションバリューが大幅に増加。"
    );
  }
  if (p.homeRuns >= 3) {
    strengths.push(
      "長打力という高レバレッジアセットの保有がチームの得点効率指数に対し単独でハイインパクトをもたらす。コンペアブル選手との差別化において最大の競争優位源泉となっている。"
    );
  }
  if (strengths.length === 0) {
    strengths.push(
      "コンスタントな出場機会の確保により個人KPIのベースライン維持に成功。チームへのリソース供給という観点から、安定的なデリバリーを実現している。"
    );
  }

  // ── Weaknesses ──
  if (p.kRate >= 0.30) {
    weaknesses.push(
      "三振というボトルネックが打席リソース全体のROIを著しく低下させている。コンタクトプロセスのBPR（ビジネスプロセス・リエンジニアリング）が最優先アクションアイテムとして浮上。"
    );
  }
  if (p.avg < 0.200) {
    weaknesses.push(
      "打率という根幹KPIのアンダーパフォーマンスがチームの攻撃力インデックスにネガティブインパクトを及ぼしている。スウィング意思決定アルゴリズムの抜本的最適化が急務。"
    );
  }
  if (p.hits < 5) {
    weaknesses.push(
      "サンプルサイズの不足により、パフォーマンス評価の信頼区間が広大に拡大。投資家（チーム）が意思決定に足る十分なデータセットの構築が喫緊の課題。"
    );
  }
  if (p.walks < 3 && p.avg < 0.250) {
    weaknesses.push(
      "選球眼の低いROIが出塁率KPIの改善を阻害。四球取得というゼロコスト・リソース獲得機会の損失は、打席効率の観点からも構造的問題として認識すべき。"
    );
  }
  if (weaknesses.length === 0) {
    weaknesses.push(
      "現状のスタッツポートフォリオにおいて特定のペインポイントが散見される。継続的なPDCAサイクルの高速化と、データドリブンな自己分析の深化が推奨される。"
    );
  }

  // ── Opportunities ──
  if (p.games.length < 10) {
    opportunities.push(
      "出場機会の拡大によりスケールメリットが発現し、個人パフォーマンスKPIのロールアップが見込まれる。市場（試合）参加率の最大化こそが最重要戦略イニシアティブ。"
    );
  }
  if (p.homeRuns >= 1) {
    opportunities.push(
      "潜在的長打力というアンタップドリソースへの投資継続により、シーズン後半において飛躍的なHR生産量の増加が期待できる。高インパクト施策への経営資源の選択と集中が戦略的に有効。"
    );
  }
  if (p.walks >= 5) {
    opportunities.push(
      "選球眼という希少コアスキルの成熟化により、出塁率KPIの継続的改善がほぼ確実視される。四球取得というローリスク・ハイリターン施策の制度的確立がWin-Winソリューションを創出する。"
    );
  }
  if (p.stolenBases >= 3) {
    opportunities.push(
      "機動力の戦略的活用により走者プレッシャーを増大させ、相手チームのディフェンシブポートフォリオに対し継続的な組織課題を生成できる。"
    );
  }
  if (opportunities.length === 0) {
    opportunities.push(
      "現在の成長トラジェクトリを維持することで、シーズン後半における指数関数的パフォーマンス向上のポテンシャルが内在している。追加的スキルの内製化により付加価値の多角化が見込まれる。"
    );
  }

  // ── Threats ──
  if (p.games.length < 5) {
    threats.push(
      "サンプル数の不足が評価の不確実性を高め、外的要因（天候・対戦相手・コンディション）によるパフォーマンスのボラティリティリスクが高止まりしている。"
    );
  }
  if (p.kRate >= 0.25) {
    threats.push(
      "高い三振率が、内部競争の激化によりチーム内での出場機会喪失リスクを漸進的に高める。コンペティター選手へのマーケットシェア侵食が中長期リスクとして顕在化。"
    );
  }
  if (p.stolenBases === 0 && p.games.length >= 5) {
    threats.push(
      "機動力という差別化要素の欠如が、相手バッテリーによる守備シフト最適化を誘発。戦術的選択肢の枯渇が中長期的な競争優位性の毀損につながるリスクが内在している。"
    );
  }
  if (p.avg < 0.220 && p.ops < 0.600) {
    threats.push(
      "複数のKPIにおける慢性的なアンダーパフォーマンスが、組織（チーム）による人的資本の再配分決定を誘発するリスクを増幅。早期のターンアラウンドが急務。"
    );
  }
  if (threats.length === 0) {
    threats.push(
      "外部環境変化（チーム戦略の転換・対戦相手のスカウティング高度化）が現行パフォーマンスモデルの持続性に影響を与えるリスクが常在している。継続的なモニタリングと環境適応力の強化が肝要。"
    );
  }

  return { strengths, weaknesses, opportunities, threats };
}

// ── 象限カード ────────────────────────────────────────────────
function QuadrantCard({
  id,
  label,
  items,
  theme,
}: {
  id: string;
  label: string;
  items: string[];
  theme: { bg: string; border: string; badge: string; text: string };
}) {
  return (
    <div className={`rounded-xl border-2 overflow-hidden flex flex-col ${theme.border}`}>
      {/* ヘッダー */}
      <div className={`px-4 py-2.5 flex items-center gap-2 ${theme.bg}`}>
        <motion.span
          className={`inline-block text-xs font-black px-2 py-0.5 rounded origin-center ${theme.badge}`}
          initial={{ scale: 2, rotate: -15, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
        >
          {id}
        </motion.span>
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#1e3a5f" }}>
          {label}
        </span>
      </div>
      {/* 内容 */}
      <div className="px-4 py-3 bg-white">
        {items.map((text, i) => (
          <p key={i} className={`text-xs leading-relaxed ${i > 0 ? "mt-2 pt-2 border-t border-slate-100" : ""} ${theme.text}`}>
            {text}
          </p>
        ))}
      </div>
    </div>
  );
}

const THEMES = {
  S: { bg: "bg-[#1e3a5f]/8", border: "border-[#1e3a5f]/40", badge: "bg-[#1e3a5f] text-white", text: "text-slate-700" },
  W: { bg: "bg-red-50", border: "border-red-200", badge: "bg-[#dc2626] text-white", text: "text-slate-700" },
  O: { bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-600 text-white", text: "text-slate-700" },
  T: { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-500 text-white", text: "text-slate-700" },
};

// ── 総合判定ロジック ──────────────────────────────────────────
function getOverallGrade(p: PlayerStats) {
  if (p.ops >= 0.900) return { grade: "S", label: "超一流・アンタッチャブル", color: "text-amber-500", border: "border-amber-500", bg: "bg-amber-500" };
  if (p.ops >= 0.800) return { grade: "A", label: "優秀・コアプレーヤー", color: "text-[#1e3a5f]", border: "border-[#1e3a5f]", bg: "bg-[#1e3a5f]" };
  if (p.ops >= 0.700) return { grade: "B", label: "標準・ローテーション", color: "text-emerald-600", border: "border-emerald-600", bg: "bg-emerald-600" };
  return { grade: "C", label: "要改善・伸びしろあり", color: "text-slate-500", border: "border-slate-500", bg: "bg-slate-500" };
}

// ── 選手セレクター ────────────────────────────────────────────
function PlayerSelect({ players, selected, onSelect }: {
  players: PlayerStats[];
  selected: PlayerStats | null;
  onSelect: (p: PlayerStats) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-[#1e3a5f] bg-white"
      >
        <span className="font-bold text-[#1e3a5f] text-sm">{selected ? selected.name : "選択してください"}</span>
        <ChevronDown size={14} className={`text-[#1e3a5f] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white rounded-xl shadow-xl border border-slate-200 max-h-52 overflow-y-auto">
          {players.map((p) => {
            const s = selected && p.name === selected.name;
            return (
              <button
                key={p.name}
                onClick={() => { onSelect(p); setOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${s ? "font-bold text-[#1e3a5f]" : "text-slate-700"}`}
              >
                <span>{p.name}</span>
                {s && <Check size={14} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── メイン ──────────────────────────────────────────────────
export default function SwotDashboard({ players }: SwotDashboardProps) {
  const filtered = players.filter((p) => !p.name.includes("助っ人"));
  const [selected, setSelected] = useState<PlayerStats | null>(null);

  const swotData = selected ? getSwot(selected) : null;
  const overallGrade = selected ? getOverallGrade(selected) : null;

  return (
    <div className="flex flex-col gap-5 px-5 py-4 pb-8">
      {/* コンサルレポートヘッダー */}
      <div className="bg-[#1e3a5f] rounded-2xl p-5 text-white">
        <p className="text-white/50 text-[10px] font-semibold tracking-[0.25em] uppercase mb-1">
          Gunies Consulting Group · Confidential
        </p>
        <h1 className="text-2xl font-black tracking-tight leading-tight">
          グニコンサル診断<br />
          <span className="text-lg font-bold text-white/80">SWOT Analysis Report</span>
        </h1>
        <div className="mt-3 pt-3 border-t border-white/10 flex gap-4 text-[10px] text-white/50">
          <span>FY2026 Season</span>
          <span>·</span>
          <span>Osaka Goonies Baseball Club</span>
        </div>
      </div>

      {/* 選手選択 */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
          診断対象アソシエイト（選手）
        </p>
        <PlayerSelect players={filtered} selected={selected} onSelect={setSelected} />
      </div>

      <AnimatePresence mode="wait">
        {!selected ? (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center justify-center py-20 px-5 text-center bg-white border border-dashed border-slate-300 rounded-2xl"
          >
            <span className="text-4xl mb-3">⚠️</span>
            <p className="text-slate-600 font-bold mb-1">選手を選択してください</p>
            <p className="text-slate-400 text-xs">診断レポートを生成するには、上のドロップダウンから対象者を選んでください。</p>
          </motion.div>
        ) : (
          <motion.div
            key={`report-${selected.name}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col gap-5"
          >
            <div className="relative">
              {/* 総合判定 ドンッ！スタンプ */}
              <motion.div
                className={`absolute -top-12 -right-2 md:right-4 z-20 flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 ${overallGrade!.border} bg-white shadow-xl rotate-[15deg]`}
                initial={{ scale: 3, opacity: 0, rotate: 0 }}
                animate={{ scale: 1, opacity: 1, rotate: 15 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.8 }}
              >
                <div className={`text-[10px] font-black uppercase tracking-widest ${overallGrade!.color}`}>総合判定</div>
                <div className={`text-4xl font-black leading-none ${overallGrade!.color}`}>{overallGrade!.grade}</div>
                <div className={`text-[8px] font-bold mt-0.5 ${overallGrade!.color}`}>{overallGrade!.label.split("・")[0]}</div>
              </motion.div>

              {/* エグゼクティブサマリー */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 relative z-10">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Executive Summary
                </p>
                <p className="text-slate-600 text-xs leading-relaxed">
                  本レポートは <span className="font-bold text-[#1e3a5f]">{selected.name}</span> 選手のFY2026シーズンにおける打撃スタッツを多角的に分析し、
                  当該選手のバリュードライバーおよびリスクファクターを可視化することを目的とする。
                  打率 <span className="font-bold">{selected.avg.toFixed(3).replace(/^0/, "")}</span>、
                  OPS <span className="font-bold">{selected.ops.toFixed(3).replace(/^0/, "")}</span>、
                  本塁打 <span className="font-bold">{selected.homeRuns}本</span>。
                  以下のSWOT分析は当社独自のフレームワークに基づき、データドリブンで策定された。
                </p>
              </div>
            </div>

            {/* SWOT 2×2グリッド */}
            <motion.div
              className="flex flex-col gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <QuadrantCard id="S" label="Strengths（強み）" items={swotData!.strengths} theme={THEMES.S} />
              <QuadrantCard id="W" label="Weaknesses（弱み）" items={swotData!.weaknesses} theme={THEMES.W} />
              <QuadrantCard id="O" label="Opportunities（機会）" items={swotData!.opportunities} theme={THEMES.O} />
              <QuadrantCard id="T" label="Threats（脅威）" items={swotData!.threats} theme={THEMES.T} />
            </motion.div>

            {/* 免責 */}
            <p className="text-slate-300 text-[9px] text-center leading-relaxed">
              本レポートはあくまで遊び目的で作成されたものであり、実際の選手評価・契約交渉等への使用を一切保証するものではありません。Gunies Consulting Group © 2026
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
