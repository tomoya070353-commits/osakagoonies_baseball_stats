"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PlayerStats } from "@/types";
import { Users, Shuffle, PartyPopper, ChevronRight, Wand2, ArrowRight } from "lucide-react";

interface AmidakujiDashboardProps {
    players: PlayerStats[];
    onBack?: () => void;
}

type Mode = "batting" | "fielding" | "custom";

interface CustomGoal {
    id: string;
    label: string;
    count: number;
}

export default function AmidakujiDashboard({ players, onBack }: AmidakujiDashboardProps) {
    // 助っ人を除外した実在選手のみをベースにする
    const basePlayers = useMemo(() => players.filter(p => !p.name.includes("助っ人")), [players]);

    // 設定ステート
    const [activePlayers, setActivePlayers] = useState<string[]>(basePlayers.map(p => p.name).slice(0, 5)); // デフォルト5人
    const [mode, setMode] = useState<Mode>("custom");
    const [customGoals, setCustomGoals] = useState<CustomGoal[]>([
        { id: "g1", label: "幹事", count: 1 },
        { id: "g2", label: "奢り", count: 1 },
    ]);
    const [defaultHitLabel, setDefaultHitLabel] = useState("一般");

    // あみだくじ実行ステート
    const [isReady, setIsReady] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // 生成されたあみだくじデータ
    const [amidaData, setAmidaData] = useState<{
        participants: { name: string; x: number }[];
        goals: { label: string; x: number, isHit: boolean }[];
        horizontalLines: { y: number; startIndex: number }[]; // startIndex と startIndex+1 をつなぐ
        routes: { player: string; path: { x: number; y: number }[]; result: { label: string, isHit: boolean } }[];
    } | null>(null);

    // SVG描画領域のサイズ参照
    const svgRef = useRef<SVGSVGElement>(null);

    // 参加者切り替え
    const togglePlayer = (name: string) => {
        setActivePlayers(prev =>
            prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
        );
    };

    // カスタムゴール追加
    const addCustomGoal = () => {
        setCustomGoals(prev => [...prev, { id: `g${Date.now()}`, label: "新しい項目", count: 1 }]);
    };

    // カスタムゴール変更
    const updateCustomGoal = (id: string, field: "label" | "count", value: string | number) => {
        setCustomGoals(prev => prev.map(g => g.id === id ? { ...g, [field]: value } : g));
    };

    // カスタムゴール削除
    const removeCustomGoal = (id: string) => {
        setCustomGoals(prev => prev.filter(g => g.id !== id));
    };

    // ゴールの生成
    const generateGoals = (): { label: string, isHit: boolean }[] => {
        const pCount = activePlayers.length;
        let goals: { label: string, isHit: boolean }[] = [];

        if (mode === "batting") {
            for (let i = 1; i <= pCount; i++) goals.push({ label: `${i}番`, isHit: false });
        } else if (mode === "fielding") {
            const positions = ["投", "捕", "一", "二", "三", "遊", "左", "中", "右", "DH", "代打", "代走"];
            for (let i = 0; i < pCount; i++) {
                goals.push({ label: positions[i] || `ポジ${i + 1}`, isHit: false });
            }
        } else if (mode === "custom") {
            // カスタムモードでは、設定された項目の数だけ当たりを生成し、残りを「一般」にする
            let totalAssigned = 0;
            customGoals.forEach(cg => {
                for (let i = 0; i < cg.count; i++) {
                    if (goals.length < pCount) {
                        goals.push({ label: cg.label, isHit: true });
                        totalAssigned++;
                    }
                }
            });
            // 残りを一般で埋める
            while (goals.length < pCount) {
                goals.push({ label: defaultHitLabel || "一般", isHit: false });
            }

            // カスタムモードの場合はシャッフル（どの縦線にどのゴールが行くかランダムにするため）
            goals = goals.sort(() => Math.random() - 0.5);
        }

        return goals;
    };

    // あみだくじの生成ロジック
    const generateAmidakuji = () => {
        if (activePlayers.length < 2) return;

        const pCount = activePlayers.length;

        // 表示用座標のスケール（SVGのviewBox基準：width 1000, height 1000）
        const width = 1000;
        const height = 1000;
        const paddingX = 100;
        const paddingY = 150;
        const usableWidth = width - paddingX * 2;
        const usableHeight = height - paddingY * 2;

        // 縦線のX座標を均等に配置
        const colSpacing = pCount > 1 ? usableWidth / (pCount - 1) : 0;
        const participants = activePlayers.map((name, i) => ({
            name,
            x: paddingX + i * colSpacing
        }));

        // ゴールの配置
        const rawGoals = generateGoals();
        const goals = rawGoals.map((g, i) => ({
            ...g,
            x: paddingX + i * colSpacing
        }));

        // 横線の生成
        // 横線は y: paddingY ~ height-paddingY の間に引かれる
        // 人数が多いほど線を増やす (目安: 人数 * 2 ~ 3)
        const lineCount = pCount * 2 + Math.floor(Math.random() * pCount);

        const horizontalLines: { y: number; startIndex: number }[] = [];

        for (let i = 0; i < lineCount; i++) {
            // startIndex は 0 ~ pCount - 2
            const startIndex = Math.floor(Math.random() * (pCount - 1));

            // 同じ高さに線が重ならないようにマージンを持たせる
            // （※厳密には startIndex と startIndex±1 が同じYで被ると破綻するため、Yをランダムにした後ソート＆間隔調整）
            horizontalLines.push({
                y: paddingY + 50 + Math.random() * (usableHeight - 100),
                startIndex
            });
        }

        // 上から下へY座標でソート
        horizontalLines.sort((a, b) => a.y - b.y);

        // 近すぎる線を少し離す（被り防止の簡易処理）
        for (let i = 1; i < horizontalLines.length; i++) {
            if (horizontalLines[i].y - horizontalLines[i - 1].y < 20) {
                horizontalLines[i].y = horizontalLines[i - 1].y + 20;
            }
        }

        // 各参加者のルートを計算
        const routes = participants.map((p, i) => {
            let currentIndex = i;
            let currentY = paddingY;

            const path: { x: number; y: number }[] = [
                { x: p.x, y: currentY }
            ];

            // 上から順に横線をチェック
            horizontalLines.forEach(line => {
                // 自分がこの横線の左端にいる場合、右へ移動
                if (line.startIndex === currentIndex) {
                    path.push({ x: participants[currentIndex].x, y: line.y }); // 曲がる点1
                    currentIndex++;
                    path.push({ x: participants[currentIndex].x, y: line.y }); // 曲がる点2
                }
                // 自分がこの横線の右端にいる場合、左へ移動
                else if (line.startIndex + 1 === currentIndex) {
                    path.push({ x: participants[currentIndex].x, y: line.y }); // 曲がる点1
                    currentIndex--;
                    path.push({ x: participants[currentIndex].x, y: line.y }); // 曲がる点2
                }
            });

            // 最後に下端まで到達
            path.push({ x: participants[currentIndex].x, y: height - paddingY });

            return {
                player: p.name,
                path,
                result: goals[currentIndex] // 最終到達先のゴール
            };
        });

        setAmidaData({ participants, goals, horizontalLines, routes });
        setIsReady(true);
        setIsFinished(false);
        setShowResults(false);
    };

    // くじの開始・リセット
    const resetSetup = () => {
        setIsReady(false);
        setAmidaData(null);
    };

    const startDrawing = () => {
        setIsDrawing(true);
        // アニメーション完了後に結果を表示するためのタイマー
        // SVG描画アニメーションの長さに合わせる（例: 4秒）
        setTimeout(() => {
            setIsDrawing(false);
            setIsFinished(true);
            setTimeout(() => setShowResults(true), 500); // 0.5秒後に結果表示
        }, 4000); // Pathアニメーション時間を 3s~4s 程度にする
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 overflow-x-hidden">
            {/* 準備画面 */}
            {!isReady && (
                <div className="px-5 py-4 flex flex-col gap-6 w-full max-w-lg mx-auto pb-24">
                    <div className="pt-2">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <Shuffle size={28} className="text-[#1e3a5f]" />
                            あみだくじ設定
                        </h1>
                        <p className="text-sm font-semibold text-slate-500 mt-2">
                            参加者を選んで、運命のくじ引きを作成しましょう。
                        </p>
                    </div>

                    {/* モード選択 */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
                            <span className="w-1 h-4 bg-[#1e3a5f] rounded-full" />
                            あみだくじのモード
                        </h2>
                        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-4">
                            <button
                                onClick={() => setMode("batting")}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${mode === "batting" ? "bg-white text-[#1e3a5f] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                            >
                                打順決め
                            </button>
                            <button
                                onClick={() => setMode("fielding")}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${mode === "fielding" ? "bg-white text-[#1e3a5f] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                            >
                                守備位置
                            </button>
                            <button
                                onClick={() => setMode("custom")}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${mode === "custom" ? "bg-white text-[#1e3a5f] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                            >
                                カスタム（余興）
                            </button>
                        </div>

                        {/* カスタムモード設定UI */}
                        <AnimatePresence>
                            {mode === "custom" && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2 overflow-hidden"
                                >
                                    <p className="text-xs font-bold text-slate-500 mb-3">当たり項目（ゴール）を自由に設定できます。</p>
                                    <div className="space-y-3 mb-4">
                                        {customGoals.map((g, index) => (
                                            <div key={g.id} className="flex gap-2 items-center">
                                                <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-black shrink-0">
                                                    {index + 1}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={g.label}
                                                    onChange={(e) => updateCustomGoal(g.id, "label", e.target.value)}
                                                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-bold focus:outline-none focus:border-[#1e3a5f]"
                                                    placeholder="例：幹事"
                                                />
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="10"
                                                        value={g.count}
                                                        onChange={(e) => updateCustomGoal(g.id, "count", parseInt(e.target.value) || 1)}
                                                        className="w-14 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-sm font-bold text-center focus:outline-none focus:border-[#1e3a5f]"
                                                    />
                                                    <span className="text-xs font-bold text-slate-500">人</span>
                                                </div>
                                                {customGoals.length > 1 && (
                                                    <button onClick={() => removeCustomGoal(g.id)} className="text-slate-400 hover:text-red-500 p-1">
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={addCustomGoal} className="text-xs font-bold text-[#1e3a5f] bg-[#1e3a5f]/10 px-3 py-1.5 rounded-lg w-full mb-4">
                                        ＋ 当たり項目を追加
                                    </button>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-slate-600 whitespace-nowrap">その他のハズレ:</span>
                                        <input
                                            type="text"
                                            value={defaultHitLabel}
                                            onChange={(e) => setDefaultHitLabel(e.target.value)}
                                            className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-bold focus:outline-none focus:border-[#1e3a5f]"
                                            placeholder="例：一般"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 参加者選択 */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                                <span className="w-1 h-4 bg-[#1e3a5f] rounded-full" />
                                参加メンバー
                            </h2>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${activePlayers.length >= 2 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                選択中: {activePlayers.length}人
                            </span>
                        </div>
                        <div className="max-h-60 overflow-y-auto grid grid-cols-2 gap-2 p-1">
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
                                            {isActive && <div className="w-2 h-2 bg-white rounded-sm" />}
                                        </div>
                                        <span className={`text-xs font-bold flex-1 truncate ${isActive ? "text-[#1e3a5f]" : "text-slate-500"}`}>
                                            {p.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-4 flex gap-2">
                            <button onClick={() => setActivePlayers(basePlayers.map(p => p.name))} className="flex-1 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200">全選択</button>
                            <button onClick={() => setActivePlayers([])} className="flex-1 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200">全解除</button>
                        </div>
                    </div>

                    {/* 生成ボタン */}
                    <button
                        onClick={generateAmidakuji}
                        disabled={activePlayers.length < 2}
                        className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-md ${activePlayers.length >= 2
                            ? "bg-gradient-to-r from-[#1e3a5f] to-[#2a4d7a] text-white hover:shadow-lg hover:-translate-y-0.5"
                            : "bg-slate-200 text-slate-400 cursor-not-allowed"
                            }`}
                    >
                        <Wand2 size={20} />
                        あみだくじを生成
                    </button>
                    {activePlayers.length < 2 && (
                        <p className="text-red-500 text-xs text-center font-bold">
                            ※2名以上選択してください
                        </p>
                    )}
                </div>
            )}

            {/* あみだくじ実行画面 */}
            {isReady && amidaData && !showResults && (
                <div className="flex-1 flex flex-col relative w-full pb-8">
                    <div className="p-4 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between sticky top-0 z-50">
                        <button onClick={resetSetup} className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200">
                            やり直す
                        </button>
                        <h2 className="text-sm font-black text-[#1e3a5f] flex items-center gap-1">
                            <Shuffle size={14} />
                            運命のあみだくじ
                        </h2>
                        {!isDrawing && !isFinished && (
                            <button onClick={startDrawing} className="text-xs font-bold text-white bg-[#1e3a5f] px-3 py-1.5 rounded-lg hover:bg-[#152a45] flex items-center gap-1 shadow-sm">
                                開始 <ArrowRight size={12} />
                            </button>
                        )}
                        {(isDrawing || isFinished) && (
                            <div className="w-16 flex justify-end">
                                <span className="text-xs font-black text-emerald-600 animate-pulse">
                                    {isFinished ? "完了" : "抽選中..."}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="w-full flex-1 min-h-[500px] overflow-hidden relative p-4 bg-slate-900 rounded-3xl mx-2 my-4 border-4 border-slate-800 shadow-2xl mt-6">
                        <svg
                            ref={svgRef}
                            viewBox="0 0 1000 1000"
                            preserveAspectRatio="xMidYMid meet"
                            className="w-full h-full"
                        >
                            {/* 背景の縦線・横線（ベース） */}
                            {amidaData.participants.map(p => (
                                <line key={`vline-${p.name}`} x1={p.x} y1={100} x2={p.x} y2={900} stroke="#334155" strokeWidth="8" strokeLinecap="round" />
                            ))}

                            {amidaData.horizontalLines.map((line, i) => {
                                const x1 = amidaData.participants[line.startIndex].x;
                                const x2 = amidaData.participants[line.startIndex + 1].x;
                                return (
                                    <line key={`hline-${i}`} x1={x1} y1={line.y} x2={x2} y2={line.y} stroke="#334155" strokeWidth="8" strokeLinecap="round" />
                                );
                            })}

                            {/* 上部の参加者名表示 */}
                            {amidaData.participants.map((p, i) => (
                                <g key={`top-${p.name}`} transform={`translate(${p.x}, 60)`}>
                                    <rect x="-30" y="-20" width="60" height="30" fill="#f8fafc" rx="8" />
                                    <text x="0" y="0" textAnchor="middle" fill="#0f172a" fontSize="20" fontWeight="bold" fontFamily="sans-serif">
                                        {p.name.slice(0, 3)}
                                    </text>
                                    <circle cx="0" cy="40" r="15" fill={isDrawing || isFinished ? "#94a3b8" : "white"} />
                                </g>
                            ))}

                            {/* 下部のゴール表示 */}
                            {amidaData.goals.map((g, i) => (
                                <g key={`goal-${i}`} transform={`translate(${g.x}, 940)`}>
                                    {/* アニメーション中はゴールを隠す(ハテナにする) */}
                                    <rect x="-45" y="-30" width="90" height="60" fill={(!isFinished && isDrawing) ? "#1e293b" : (g.isHit ? "#ef4444" : "#1e293b")} rx="12" stroke={g.isHit ? "#fca5a5" : "#475569"} strokeWidth="4" />
                                    <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" fill={(!isFinished && isDrawing) ? "#94a3b8" : "white"} fontSize="24" fontWeight="900" fontFamily="sans-serif">
                                        {(!isFinished && isDrawing) ? "?" : g.label.slice(0, 5)}
                                    </text>
                                </g>
                            ))}

                            {/* 参加者の軌跡アニメーション */}
                            {isDrawing && amidaData.routes.map((route, i) => {
                                // パスデータを生成 (M x,y L x,y L x,y...)
                                const d = `M ${route.path.map(pt => `${pt.x},${pt.y}`).join(" L ")}`;

                                // カラフルな線の色
                                const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#0ea5e9"];
                                const color = colors[i % colors.length];

                                return (
                                    <motion.path
                                        key={`route-${route.player}`}
                                        d={d}
                                        fill="none"
                                        stroke={color}
                                        strokeWidth="12"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 3.5, ease: "linear" }}
                                        style={{ filter: `drop-shadow(0px 0px 8px ${color})` }}
                                    />
                                );
                            })}

                            {/* 完了後の全ルート表示（透明度を下げて表示） */}
                            {isFinished && amidaData.routes.map((route, i) => {
                                const d = `M ${route.path.map(pt => `${pt.x},${pt.y}`).join(" L ")}`;
                                const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#0ea5e9"];
                                const color = colors[i % colors.length];

                                return (
                                    <path
                                        key={`route-finished-${route.player}`}
                                        d={d}
                                        fill="none"
                                        stroke={color}
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        opacity={0.7}
                                    />
                                );
                            })}
                        </svg>

                        {/* SVGを覆う光の演出（終了時） */}
                        {isFinished && (
                            <motion.div
                                className="absolute inset-0 bg-white"
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* 結果発表サマリー画面 */}
            <AnimatePresence>
                {showResults && amidaData && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md overflow-y-auto"
                    >
                        <div className="min-h-full flex flex-col justify-end sm:justify-center sm:items-center pt-24 pb-0 sm:py-10">
                            <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col border border-slate-200 mt-auto sm:mt-0">

                                <div className="bg-gradient-to-br from-[#1e3a5f] to-[#152a45] px-6 py-8 text-center relative overflow-hidden shrink-0 rounded-t-3xl sm:rounded-t-3xl">
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                        className="absolute inset-0 flex items-center justify-center opacity-20"
                                    >
                                        <PartyPopper size={120} className="text-white" />
                                    </motion.div>
                                    <h2 className="text-3xl font-black text-white relative z-10 tracking-widest drop-shadow-md">
                                        RESULTS
                                    </h2>
                                    <p className="text-slate-300 text-sm font-bold mt-2 relative z-10">あみだくじの結果が確定しました</p>
                                </div>

                                <div className="flex-1 p-4 bg-slate-50 space-y-2">
                                    {amidaData.routes.map((route, i) => (
                                        <motion.div
                                            key={route.player}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + i * 0.1 }}
                                            className={`flex items-center justify-between p-4 rounded-xl border ${route.result.isHit ? "bg-red-50 border-red-200 shadow-sm" : "bg-white border-slate-200"}`}
                                        >
                                            <span className="font-black text-slate-800 flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px]">{i + 1}</div>
                                                {route.player}
                                            </span>
                                            <span className={`text-lg font-black px-3 py-1 rounded-lg ${route.result.isHit ? "bg-red-500 text-white shadow-md shadow-red-500/20" : "bg-slate-100 text-slate-600"}`}>
                                                {route.result.label}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="p-4 pb-12 sm:pb-6 bg-white border-t border-slate-200 shrink-0">
                                    <button
                                        onClick={() => {
                                            setShowResults(false);
                                        }}
                                        className="w-full bg-[#1e3a5f] text-white py-4 rounded-xl font-black text-lg transition-transform active:scale-[0.98] shadow-md hover:bg-[#152a45]"
                                    >
                                        結果を閉じてやり直す
                                    </button>
                                </div>

                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
