"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import type { PlayerStats } from "@/types";

interface SprayChartProps {
    player: PlayerStats;
}

// 簡易的な乱数生成（名前に基づいてシード値を決定し、毎回同じ結果になるようにする）
function xmur3(str: string) {
    for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = h << 13 | h >>> 19;
    }
    return function () {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h ^= h >>> 16) >>> 0;
    }
}

function sfc32(a: number, b: number, c: number, d: number) {
    return function () {
        a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
        var t = (a + b | 0) + d | 0;
        d = d + 1 | 0;
        a = b ^ b >>> 9;
        b = c + (c << 3) | 0;
        c = c << 21 | c >>> 11;
        c = c + t | 0;
        return (t >>> 0) / 4294967296;
    }
}

interface HitDot {
    id: number;
    isHit: boolean;
    x: number; // 0 ~ 100 (%)
    y: number; // 0 ~ 100 (%)
}

export default function SprayChart({ player }: SprayChartProps) {
    // プレイヤー名をシードにしてランダムに15個の打球データを生成
    const dots = useMemo(() => {
        const seed = xmur3(player.name + "spray");
        const rand = sfc32(seed(), seed(), seed(), seed());

        // スプレーの傾向（少しランダム）
        // 引っ張り傾向か、流し打ち傾向か
        const pullTendency = rand();

        const numDots = 15 + Math.floor(rand() * 10); // 15〜24個のドット
        const newDots: HitDot[] = [];

        for (let i = 0; i < numDots; i++) {
            // 扇形のフィールド内に収まるようにX, Y座標を生成
            // Home plate is roughly bottom-center: x=50, y=100

            // Hit or Out: 打率を考慮してヒットが出る確率を調整
            const isHit = rand() < Math.max(0.2, player.avg * 1.5);

            // X: 10 ~ 90の間 (50がセンター)
            // Y: 10 ~ 85の間 (0が外野フェンス、100がホームベース)

            // 三角形・扇形の制約：Yが小さい（奥に行く）ほど、Xの許容幅が広がる
            // y=85 (内野) -> Xは40~60
            // y=10 (外野フェンス) -> Xは10~90

            const y = 10 + rand() * 75; // 10 to 85

            // Yに基づいてXの幅を計算（ファウルラインを大雑把に模倣）
            // Center is 50. Max deviation increases as y decreases.
            const maxDev = ((100 - y) / 90) * 45; // Max 45 at y=10, 7.5 at y=85

            // 引っ張り傾向(0~1)を加味（0.5が均等）
            // 左打者か右打者かのデータがないため、単にランダムで傾向を持たせる
            const bias = (pullTendency - 0.5) * 20; // -10 to 10

            let x = 50 + (rand() * 2 - 1) * maxDev + bias;

            // 制約に収める
            x = Math.max(5, Math.min(95, x));

            newDots.push({ id: i, isHit, x, y });
        }

        return newDots;
    }, [player]);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mt-4">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🏟️</span>
                <h3 className="font-black text-slate-800 tracking-tight">打球方向 <span className="text-xs text-slate-400 font-bold ml-1">Spray Chart</span></h3>
            </div>

            <div className="flex gap-4 mb-4 justify-center">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                    <span className="text-[10px] font-bold text-slate-500">ヒット</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                    <span className="text-[10px] font-bold text-slate-500">アウト</span>
                </div>
            </div>

            <div className="w-full max-w-sm mx-auto aspect-[1/1.1] relative bg-emerald-600 rounded-t-full overflow-hidden border-4 border-slate-300 shadow-inner">
                {/* レフトとライトのファウルライン */}
                <div className="absolute top-0 left-0 w-full h-full">
                    {/* 左ファウルライン */}
                    <div className="absolute w-[2px] h-[150%] bg-white/70 origin-bottom-right" style={{ bottom: '-5%', left: '-5%', transform: 'rotate(45deg)' }} />
                    {/* 右ファウルライン */}
                    <div className="absolute w-[2px] h-[150%] bg-white/70 origin-bottom-left" style={{ bottom: '-5%', right: '-5%', transform: 'rotate(-45deg)' }} />

                    {/* 内野のダート（土） */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[60%] aspect-square bg-[#A67B5B] rounded-full sm:bottom-6" style={{ transform: 'translateX(-50%) rotate(45deg)' }}>
                        {/* 芝生のダイヤ（内野） */}
                        <div className="absolute top-1/2 left-1/2 w-[65%] h-[65%] bg-emerald-500 rounded-sm -translate-x-1/2 -translate-y-1/2" />
                    </div>

                    {/* ベース */}
                    {/* ホーム */}
                    <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-4 h-4 bg-white clip-polygon-home z-10 sm:bottom-[10%]" />
                    {/* 一塁 */}
                    <div className="absolute bottom-[28%] right-[22%] w-3 h-3 bg-white rotate-45 z-10" />
                    {/* 二塁 */}
                    <div className="absolute bottom-[48%] left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 z-10" />
                    {/* 三塁 */}
                    <div className="absolute bottom-[28%] left-[22%] w-3 h-3 bg-white rotate-45 z-10" />

                    {/* マウンド */}
                    <div className="absolute bottom-[28%] left-1/2 -translate-x-1/2 w-6 h-6 bg-[#A67B5B] rounded-full flex items-center justify-center z-10">
                        <div className="w-3 h-1 bg-white" />
                    </div>

                    {/* 外野フェンスの曲線（ダミー） */}
                    <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[120%] h-[120%] border-t-[8px] border-emerald-800 rounded-full opacity-30 pointer-events-none" />
                </div>

                {/* 打球ドットのアニメーション表示 */}
                <motion.div
                    className="absolute inset-0 z-20 pointer-events-none"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-10px" }}
                    variants={{
                        show: {
                            transition: {
                                staggerChildren: 0.05,
                            }
                        }
                    }}
                >
                    {dots.map(dot => (
                        <motion.div
                            key={dot.id}
                            className={`absolute w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2 ${dot.isHit
                                    ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] border-[1.5px] border-white/40"
                                    : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] border-[1.5px] border-white/40"
                                }`}
                            style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
                            variants={{
                                hidden: { scale: 0, opacity: 0 },
                                show: { scale: 1.2, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 15 } }
                            }}
                        />
                    ))}
                </motion.div>
            </div>

            <p className="text-[10px] text-center text-slate-400 mt-4 leading-relaxed max-w-[280px] mx-auto">
                ※打球位置はスタッツ（打率など）と選手の個性を元にシミュレートされたダミーデータです。
            </p>

            {/* カスタムクリップパス（ホームベース形状） */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .clip-polygon-home {
          clip-path: polygon(50% 0%, 100% 40%, 100% 100%, 0% 100%, 0% 40%);
        }
      `}} />
        </div>
    );
}
