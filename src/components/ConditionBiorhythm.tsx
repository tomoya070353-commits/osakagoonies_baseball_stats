"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import type { PlayerStats } from "@/types";

interface ConditionBiorhythmProps {
  player: PlayerStats;
}

interface TrendData {
  date: string;
  atBats: number;
  hits: number;
  onBase: number;
  label: string;
  value: number; // 0~1 の割合 (Y軸用)
}

export default function ConditionBiorhythm({ player }: ConditionBiorhythmProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 直近5試合のデータを抽出 (左から古い順にしたいので、reverseする)
  // games は新しい順(降順)になっている前提
  const recentGames = [...player.games].slice(0, 5).reverse();

  if (recentGames.length === 0) {
    return null; // 試合データがない場合は表示しない
  }

  // グラフ用のデータポイントを生成
  const trendData: TrendData[] = recentGames.map((game) => {
    let atBats = 0;
    let hits = 0;
    let onBase = 0;

    game.atBats.forEach((ab) => {
      if (!ab.isWalkOrHBP && !ab.isSacrificeBunt && !ab.isSacrificeFly) {
        atBats++;
      }
      if (ab.isHit) hits++;
      if (ab.isHit || ab.isWalkOrHBP) onBase++;
    });

    // 基本は打率（打数がない場合は出塁率など、ここでは0とするか特別扱いか）
    const value = atBats > 0 ? hits / atBats : (onBase > 0 ? 1 : 0);
    const label = `${atBats}打数${hits}安打${onBase > hits ? ` ${onBase - hits}四死球` : ""}`;
    
    // 日付フォーマット mm/dd
    const dateStr = game.date.includes("/") || game.date.includes("-") 
      ? game.date.split(/[-/]/).slice(-2).join("/") 
      : game.date;

    return {
      date: dateStr,
      atBats,
      hits,
      onBase,
      label,
      value: Math.min(Math.max(value, 0), 1), // 念のため0~1にクランプ
    };
  });

  // SVG描画ロジック
  const width = 300;
  const height = 120;
  const paddingX = 30;
  // paddingY は上下に余裕を持たせる（1.0のとき上端、0.0のとき下端）
  const paddingYTop = 20; 
  const paddingYBottom = 30;

  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingYTop - paddingYBottom;

  // 点の座標を計算
  const points = trendData.map((d, i) => {
    // データが1件なら中央、複数なら等間隔
    const x = trendData.length === 1 
      ? paddingX + innerWidth / 2
      : paddingX + (i / (trendData.length - 1)) * innerWidth;
      
    // value=1 が上(paddingYTop)、value=0 が下(高さ-paddingYBottom)
    const y = paddingYTop + (1 - d.value) * innerHeight;
    return { x, y, data: d, index: i };
  });

  // SVG Path (折れ線)
  const pathData = points.length > 0
    ? `M ${points.map((p) => `${p.x},${p.y}`).join(" L ")}`
    : "";

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden mb-5">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
        <span className="text-lg">📈</span>
        <h3 className="text-sm font-bold text-slate-700">コンディション・バイオリズム <span className="text-xs font-normal text-slate-400 ml-1">(直近5試合)</span></h3>
      </div>

      <div className="relative p-4 flex justify-center items-center" ref={ref}>
        {/* Y軸のガイドライン（背景） */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between" 
             style={{ padding: `${paddingYTop + 16}px ${paddingX + 16}px ${paddingYBottom + 16}px` }}>
          <div className="w-full border-t border-dashed border-slate-200 h-0" />
          <div className="w-full border-t border-dashed border-slate-200 h-0" />
          <div className="w-full border-t border-dashed border-slate-200 h-0" />
        </div>

        {/* SVGグラフ本体 */}
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-w-[400px] overflow-visible"
        >
          <defs>
            {/* ラインのグラデーション */}
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#1e3a5f" />
            </linearGradient>
            
            {/* ドロップシャドウ */}
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* 折れ線（アニメーション付き） */}
          <motion.path
            d={pathData}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#shadow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={inView ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />

          {/* 各データ点 */}
          {points.map((p) => {
            const isHovered = hoveredIndex === p.index;
            // 成績が良い(value>0)場合はハイライト色
            const isGood = p.data.value > 0;

            return (
              <g key={p.index}>
                {/* 縦の点線（ガイド） */}
                <line 
                  x1={p.x} y1={p.y} 
                  x2={p.x} y2={height - 20} 
                  stroke="#e2e8f0" 
                  strokeWidth="1" 
                  strokeDasharray="2 2" 
                />
                
                {/* X軸のラベル（日付） */}
                <text
                  x={p.x}
                  y={height - 5}
                  fontSize="10"
                  fill="#94a3b8"
                  textAnchor="middle"
                  className="font-medium"
                >
                  {p.data.date}
                </text>

                {/* データポイントの円（アニメーション付き） */}
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 4.5}
                  fill={isGood ? "#1e3a5f" : "#94a3b8"}
                  stroke="#ffffff"
                  strokeWidth="2"
                  filter="url(#shadow)"
                  initial={{ cy: p.y + 20, opacity: 0 }}
                  animate={inView ? { cy: p.y, opacity: 1 } : {}}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.5 + p.index * 0.15, // 左から順にポンポンと浮き上がる
                    type: "spring", 
                    stiffness: 200, 
                    damping: 12 
                  }}
                  onMouseEnter={() => setHoveredIndex(p.index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onTouchStart={() => setHoveredIndex(p.index)}
                  className="cursor-pointer transition-all duration-200"
                />

                {/* ツールチップ（マウスオーバー/タップ時） */}
                <motion.g
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ 
                    opacity: isHovered ? 1 : 0, 
                    y: isHovered ? -5 : 5,
                    scale: isHovered ? 1 : 0.9
                  }}
                  transition={{ duration: 0.2 }}
                  className="pointer-events-none"
                >
                  {/* ふきだし背景 */}
                  <rect
                    x={p.x - 35}
                    y={p.y - 35}
                    width="70"
                    height="20"
                    rx="4"
                    fill="#1e293b"
                    filter="url(#shadow)"
                  />
                  {/* 下向きの三角形 */}
                  <polygon
                    points={`${p.x-4},${p.y-16} ${p.x+4},${p.y-16} ${p.x},${p.y-12}`}
                    fill="#1e293b"
                  />
                  {/* テキスト */}
                  <text
                    x={p.x}
                    y={p.y - 21}
                    fontSize="9"
                    fill="#ffffff"
                    textAnchor="middle"
                    className="font-bold"
                  >
                    {p.data.label}
                  </text>
                </motion.g>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
