"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import type { PlayerStats } from "@/types";
import { Loader2, Users, ArrowRight, Shield, Check } from "lucide-react";

interface LineupSimulatorProps {
    players: PlayerStats[];
    onBack?: () => void;
}

interface LineupSpot {
    order: number;
    player: PlayerStats;
    reason: string;
}

export default function LineupSimulator({ players, onBack }: LineupSimulatorProps) {
    // 「助っ人」を除外した実在選手のみをベースにする（任意）
    const basePlayers = players.filter(p => !p.name.includes("助っ人"));

    // 参加メンバー（初期状態は全員参加）
    const [activePlayers, setActivePlayers] = useState<string[]>(basePlayers.map(p => p.name));

    const [lineup, setLineup] = useState<LineupSpot[] | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const togglePlayer = (name: string) => {
        setActivePlayers(prev =>
            prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
        );
    };

    const generateLineup = () => {
        if (activePlayers.length < 9) return;

        setIsAnalyzing(true);
        setLineup(null);

        // AI（ルールベース）による打順生成シミュレーション（意図的な遅延を追加）
        setTimeout(() => {
            // 参加選手のみのプールを作成
            let pool = basePlayers.filter(p => activePlayers.includes(p.name));
            const newLineup: LineupSpot[] = [];

            // ヘルパー：プールから条件に合う選手を抽出し、プールから削除して返す
            const extractPlayer = (
                sortFn: (a: PlayerStats, b: PlayerStats) => number,
                reason: string
            ): LineupSpot | null => {
                if (pool.length === 0) return null;
                pool.sort(sortFn);
                const selected = pool[0];
                pool = pool.filter(p => p.name !== selected.name);
                return { order: 0, player: selected, reason };
            };

            // 1番: 最高OBP（出塁率）
            const spot1 = extractPlayer((a, b) => b.obp - a.obp, "チームNo.1の出塁率！切り込み隊長");
            if (spot1) { spot1.order = 1; newLineup.push(spot1); }

            // 2番: 残りで最高OPS
            const spot2 = extractPlayer((a, b) => b.ops - a.ops, "強打の2番！初回からチャンス拡大");
            if (spot2) { spot2.order = 2; newLineup.push(spot2); }

            // 3番・4番: 残りで最高SLG（または本塁打・打点）
            const spot3 = extractPlayer((a, b) => b.slg - a.slg, "クリーンナップの一角！長打に期待");
            if (spot3) { spot3.order = 3; newLineup.push(spot3); }

            const spot4 = extractPlayer((a, b) => (b.homeRuns + b.rbi) - (a.homeRuns + a.rbi), "チームの主砲！不動の4番");
            if (spot4) { spot4.order = 4; newLineup.push(spot4); }

            // 9番: 残りで最高OBP（上位への繋がり） ※先に9番を決める
            const spot9 = extractPlayer((a, b) => b.obp - a.obp, "上位打線へ繋ぐ！第2のリードオフマン");
            // 9番は後で配列の最後に追加するため一時保持

            // 5〜8番: 残りをOPS順で配置
            pool.sort((a, b) => b.ops - a.ops);
            const spots5_8: LineupSpot[] = pool.slice(0, 4).map((p, i) => {
                let reason = "確実なバッティングでチャンスメイク";
                if (i === 0) reason = "下位打線のポイントゲッター";
                if (i === 1) reason = "パンチ力を秘めた伏兵";
                return { order: 5 + i, player: p, reason };
            });
            newLineup.push(...spots5_8);

            // プールから5~8番として選ばれた選手を除外
            const spots5_8Names = spots5_8.map(s => s.player.name);
            pool = pool.filter(p => !spots5_8Names.includes(p.name));

            // 9番を追加
            if (spot9) {
                spot9.order = 9;
                newLineup.push(spot9);
            }

            setLineup(newLineup);
            setIsAnalyzing(false);
        }, 1800);
    };

    // アニメーションVariants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="flex flex-col gap-5 px-5 py-4 pb-12 overflow-x-hidden">
            {/* ヘッダー */}
            <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-white text-xs mb-3 shadow-sm border border-slate-700">
                    <Shield size={14} className="text-emerald-400" />
                    <span className="font-bold tracking-widest">AI LINEUP SIMULATOR</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    AIスタメン<br />打順シミュレーター
                </h1>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                    セイバーメトリクス（OPSやOBP等）に基づき、本日の参加メンバーから勝利確率を最大化する最適な打順を導き出します。
                </p>
            </div>

            {!lineup && !isAnalyzing && (
                <motion.div
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
                        <p className="text-slate-700 text-sm font-black flex items-center gap-2">
                            <Users size={16} className="text-[#1e3a5f]" />
                            本日の参加メンバー
                        </p>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${activePlayers.length >= 9 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            選択中: {activePlayers.length}人
                        </span>
                    </div>

                    <div className="p-4 grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                        {basePlayers.map(p => {
                            const isActive = activePlayers.includes(p.name);
                            return (
                                <button
                                    key={p.name}
                                    onClick={() => togglePlayer(p.name)}
                                    className={`flex items-center gap-2 p-2 rounded-lg border-2 text-left transition-colors ${isActive ? "border-[#1e3a5f] bg-[#1e3a5f]/5" : "border-slate-100 bg-slate-50 grayscale opacity-50"
                                        }`}
                                >
                                    <div className={`w-4 h-4 rounded-sm flex items-center justify-center border ${isActive ? "bg-[#1e3a5f] border-[#1e3a5f]" : "bg-white border-slate-300"}`}>
                                        {isActive && <Check size={12} className="text-white" />}
                                    </div>
                                    <span className={`text-sm font-bold flex-1 truncate ${isActive ? "text-[#1e3a5f]" : "text-slate-500"}`}>
                                        {p.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-200">
                        <button
                            onClick={generateLineup}
                            disabled={activePlayers.length < 9}
                            className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all ${activePlayers.length >= 9
                                ? "bg-[#1e3a5f] text-white hover:bg-[#152a45] shadow-md hover:shadow-lg hover:-translate-y-0.5"
                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                }`}
                        >
                            最適打順を生成する
                            <ArrowRight size={20} />
                        </button>
                        {activePlayers.length < 9 && (
                            <p className="text-red-500 text-xs text-center mt-2 font-bold select-none">
                                ※シミュレーションには9人以上の選択が必要です
                            </p>
                        )}
                    </div>
                </motion.div>
            )}

            {/* 分析中ローディング */}
            <AnimatePresence>
                {isAnalyzing && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                        className="flex flex-col items-center justify-center py-20 px-5 text-center bg-slate-900 rounded-3xl text-white shadow-2xl relative overflow-hidden"
                    >
                        {/* スキャンラインエフェクト */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent w-full h-[50%]"
                            animate={{ y: ["-100%", "300%"] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        />

                        <Loader2 size={48} className="text-cyan-400 animate-spin mb-4 relative z-10" />
                        <h2 className="text-2xl font-black tracking-widest relative z-10">ANALYZING...</h2>
                        <p className="text-cyan-200/60 text-xs mt-2 font-mono relative z-10">
                            Applying Sabermetrics Algorithim
                            <motion.span
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                            >...</motion.span>
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 結果表示 */}
            <AnimatePresence>
                {lineup && !isAnalyzing && (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="flex flex-col gap-3"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                <span className="w-2 h-6 rounded-full bg-[#1e3a5f]" />
                                本日の最適オーダー
                            </h3>
                            <button
                                onClick={() => setLineup(null)}
                                className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors"
                            >
                                再選択
                            </button>
                        </div>

                        {lineup.map((spot) => (
                            <motion.div
                                key={spot.player.name}
                                variants={itemVariants}
                                className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex items-center gap-4 relative overflow-hidden group"
                            >
                                {/* 順位バッジ */}
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 text-[#1e3a5f] flex flex-col items-center justify-center font-black border border-slate-200 shadow-inner group-hover:bg-[#1e3a5f] group-hover:text-white transition-colors">
                                    <span className="text-lg leading-none">{spot.order}</span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline justify-between gap-2 mb-0.5">
                                        <h4 className="text-base font-black text-slate-900 truncate">
                                            {spot.player.name}
                                        </h4>
                                        <div className="flex gap-2 text-[10px] font-bold text-slate-400">
                                            <span>AVG <span className="text-slate-700">{spot.player.avg.toFixed(3).replace(/^0/, "")}</span></span>
                                            <span>OPS <span className="text-slate-700">{spot.player.ops.toFixed(3).replace(/^0/, "")}</span></span>
                                        </div>
                                    </div>
                                    {/* AI推薦理由バッジ */}
                                    <div className="inline-flex max-w-full">
                                        <p className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded truncate">
                                            ✨ {spot.reason}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
