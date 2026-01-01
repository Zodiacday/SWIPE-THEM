/**
 * Boss Fight Component - Obsidian Mint Edition
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Skull, Zap, Target } from "lucide-react";

interface BossFightProps {
    senderName: string;
    domain: string;
    emailCount: number;
    onComplete: () => void;
    onSkip: () => void;
}

export function BossFight({
    senderName,
    domain,
    emailCount,
    onComplete,
    onSkip,
}: BossFightProps) {
    const [bossHealth, setBossHealth] = useState(100);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (bossHealth <= 0) {
            setTimeout(() => {
                setIsActive(false);
                onComplete();
            }, 1000);
        }
    }, [bossHealth, onComplete]);

    const handleHit = () => {
        const damage = 100 / emailCount;
        setBossHealth((prev) => Math.max(0, prev - damage));
    };

    return (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-[#09090b]/95 backdrop-blur-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Background effects */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-red-500/10 rounded-full blur-[120px] animate-pulse" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 max-w-xl w-full mx-4 glass border-zinc-800 p-8 md:p-12 rounded-[2.5rem] shadow-2xl">
                        <motion.div
                            className="text-center mb-10"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full mb-6">
                                <Skull className="w-4 h-4 text-red-500" />
                                <span className="text-xs font-bold text-red-500 uppercase tracking-[0.2em]">
                                    Cluster Boss Detected
                                </span>
                            </div>

                            <h2 className="text-4xl md:text-5xl font-heading font-black mb-2">
                                {senderName}
                            </h2>
                            <p className="text-zinc-500 font-medium">
                                @{domain} • {emailCount} emails
                            </p>
                        </motion.div>

                        {/* Boss Health */}
                        <div className="mb-12">
                            <div className="flex justify-between items-end mb-3 px-1">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Stability</span>
                                <span className="text-xl font-heading font-black text-red-500">
                                    {Math.round(bossHealth)}%
                                </span>
                            </div>
                            <div className="h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-red-600 to-orange-500 glow-red"
                                    initial={{ width: "100%" }}
                                    animate={{ width: `${bossHealth}%` }}
                                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                />
                            </div>
                        </div>

                        {/* Action Area */}
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={handleHit}
                                disabled={bossHealth <= 0}
                                className="w-full group relative flex items-center justify-center gap-3 px-8 py-5 bg-white text-black text-xl font-bold rounded-2xl hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-xl disabled:opacity-50"
                            >
                                <Zap className="w-6 h-6 fill-current group-hover:rotate-12 transition-transform" />
                                SWIPE TO ATTACK
                                <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:animate-ping pointer-events-none" />
                            </button>

                            <button
                                onClick={onSkip}
                                className="w-full py-3 text-zinc-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
                            >
                                Bypass Boss
                            </button>
                        </div>

                        {/* Victory Message */}
                        <AnimatePresence>
                            {bossHealth <= 0 && (
                                <motion.div
                                    className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-[2.5rem]"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <div className="text-center">
                                        <div className="text-6xl mb-4">✨</div>
                                        <h3 className="text-4xl font-heading font-black text-emerald-500 mb-2 uppercase italic tracking-tighter">
                                            Neutralized
                                        </h3>
                                        <p className="text-zinc-400 font-bold">
                                            +{emailCount * 10} XP / {emailCount * 5} Score
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
