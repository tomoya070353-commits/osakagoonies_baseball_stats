"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Confetti = () => {
    const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    }, []);

    if (windowDimensions.width === 0) return null;

    const colors = ["#FFD700", "#FFA500", "#FF6347", "#00BFFF", "#32CD32", "#FF69B4", "#FFFFFF"];

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 80 }).map((_, i) => {
                const isCircle = i % 2 === 0;
                const color = colors[i % colors.length];
                const left = Math.random() * 100;
                const size = Math.random() * 12 + 6;
                const delay = Math.random() * 2;
                const duration = Math.random() * 2 + 2;

                return (
                    <motion.div
                        key={i}
                        className="absolute top-[-5%]"
                        style={{
                            left: `${left}%`,
                            width: size,
                            height: size,
                            backgroundColor: color,
                            borderRadius: isCircle ? "50%" : "0%",
                        }}
                        initial={{ y: -50, rotate: 0, opacity: 1 }}
                        animate={{
                            y: windowDimensions.height + 100,
                            rotate: 360,
                            opacity: [1, 1, 0],
                            x: `${(Math.random() - 0.5) * 200}px`,
                        }}
                        transition={{
                            duration,
                            delay,
                            ease: "linear",
                            repeat: Infinity,
                        }}
                    />
                );
            })}
        </div>
    );
};

export default function SplashScreen() {
    return (
        <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" as const }}
        >
            <Confetti />

            {/* Celebratory Messages */}
            <motion.div 
                className="flex flex-col items-center mb-10 z-10"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
            >
                <motion.h2 
                    className="text-yellow-500 font-black text-2xl md:text-3xl tracking-[0.1em] mb-1 drop-shadow-[0_0_4px_rgba(250,204,21,0.5)] text-center"
                    animate={{ textShadow: ["0px 0px 4px #facc15", "0px 0px 12px #facc15", "0px 0px 4px #facc15"] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    CONGRATULATIONS!
                </motion.h2>
                <h3 className="text-yellow-600 font-bold text-sm md:text-base tracking-[0.2em] mb-4 text-center">
                    SPRING TOURNAMENT CHAMPIONS
                </h3>
                <div className="relative">
                    <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-30 rounded-full" />
                    <h1 className="relative text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-600 drop-shadow-sm text-center">
                        祝・春季大会優勝
                    </h1>
                </div>
            </motion.div>

            {/* Team Logo and Info */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8, type: "spring" }}
                className="z-10 flex flex-col items-center"
            >
                <motion.img
                    src="/team-icon.png"
                    alt="Osaka Goonies"
                    className="w-32 h-32 md:w-40 md:h-40 object-contain mb-6 drop-shadow-xl"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <h1 className="text-3xl font-black text-slate-900 tracking-tight drop-shadow-sm">
                    Osaka Goonies
                </h1>
                <p className="text-sm font-semibold text-slate-500 mt-2 tracking-wide">
                    Supported by グニちゃんねる
                </p>
            </motion.div>
        </motion.div>
    );
}
