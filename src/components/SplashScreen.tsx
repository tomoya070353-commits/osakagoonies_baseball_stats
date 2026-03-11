"use client";

import { motion } from "framer-motion";

export default function SplashScreen() {
    return (
        <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" as const }}
        >
            <img
                src="/team-icon.png"
                alt="Osaka Goonies"
                className="w-32 h-32 object-contain mb-6 drop-shadow-md"
            />
            <h1 className="text-3xl font-black text-[#1e3a5f] tracking-tight">
                Osaka Goonies
            </h1>
            <p className="text-sm font-semibold text-slate-500 mt-2 tracking-wide">
                Supported by グニちゃんねる
            </p>
        </motion.div>
    );
}
