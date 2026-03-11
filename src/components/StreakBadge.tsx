"use client";

import { motion } from "framer-motion";

interface StreakBadgeProps {
  type: "hitting" | "onBase";
  count: number;
}

export default function StreakBadge({ type, count }: StreakBadgeProps) {
  if (count < 1) return null;

  const isHitting = type === "hitting";
  const label = isHitting ? "試合連続安打" : "試合連続出塁";
  
  // 連続記録が2以上の場合はバッジをメラメラ燃やす
  const shouldAnimate = count >= 2;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border text-[10px] font-bold shadow-sm ${
        isHitting 
          ? "bg-red-50 text-red-600 border-red-200" 
          : "bg-orange-50 text-orange-600 border-orange-200"
      }`}
    >
       <motion.span
        animate={shouldAnimate ? {
          rotate: [-4, 4, -4],
          scale: [1, 1.1, 1]
        } : {}}
        transition={shouldAnimate ? {
          repeat: Infinity,
          duration: 0.6,
          ease: "easeInOut"
        } : {}}
      >
        🔥
      </motion.span>
      <span>{count}{label}</span>
    </motion.div>
  );
}
