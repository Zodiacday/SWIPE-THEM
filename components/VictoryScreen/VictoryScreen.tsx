/**
 * VictoryScreen Component - Obsidian Mint Edition
 */

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock, Trash2, Flame, Star, Share2, Settings, ArrowRight } from "lucide-react";

interface SessionStats {
    emailsCleared: number;
    timeSavedMinutes: number;
    topSendersRemoved: string[];
    streakCount: number;
    inboxHealthScore: number;
    xpEarned: number;
}

interface VictoryScreenProps {
    stats: SessionStats;
    onShare?: () => void;
    onSetupAutomation?: () => void;
    onClose: () => void;
}

export function VictoryScreen({
    stats,
    onShare,
    onSetupAutomation,
    onClose,
}: VictoryScreenProps) {
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowConfetti(false), 4000);
        return () => clearTimeout(timer);
    }, []);

    const confettiColors = ["#10b981", "#34d399", "#059669", "#ffffff", "#18181b"];

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[70] flex items-center justify-center bg-[#09090b]/90 backdrop-blur-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Emerald Confetti */}
                {showConfetti && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(40)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 h-3 rounded-full"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: "-20px",
                                    background: confettiColors[i % confettiColors.length],
                                }}
                                initial={{ y: 0, rotate: 0, opacity: 1 }}
                                animate={{
                                    y: 1000,
                                    rotate: Math.random() * 360,
                                    opacity: [1, 1, 0],
                                }}
                                transition={{
                                    duration: 2 + Math.random() * 2,
                                    delay: i * 0.05,
                                    ease: "easeIn",
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Victory Modal */}
                <motion.div
                    className="relative max-w-lg w-full mx-4 glass border-zinc-800 p-8 md:p-12 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
                    initial={{ scale: 0.9, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                >
                    {/* Background glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />

                    <div className="flex justify-center mb-8">
                        <motion.div
                            className="w-20 h-20 rounded-[2rem] bg-emerald-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                            initial={{ rotate: -20, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ type: "spring", delay: 0.2 }}
                        >
                            <Trophy size={40} className="text-black fill-current" />
                        </motion.div>
                    </div>

                    <div className="text-center mb-10">
                        <h1 className="text-4xl md:text-5xl font-heading font-black mb-3 italic tracking-tighter uppercase">
                            Inbox Purged
                        </h1>
                        <p className="text-zinc-500 font-medium">Efficient. Clean. Mastered.</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-10">
                        {[
                            { label: "Cleared", val: stats.emailsCleared, icon: Trash2 },
                            { label: "Minutes Saved", val: stats.timeSavedMinutes.toFixed(1), icon: Clock },
                            { label: "Streak", val: stats.streakCount, icon: Flame },
                            { label: "XP Gained", val: `+${stats.xpEarned}`, icon: Star },
                        ].map((s, i) => (
                            <div key={i} className="bg-zinc-950/50 border border-zinc-900 rounded-2xl p-4 flex flex-col items-center">
                                <s.icon className="w-4 h-4 text-emerald-500 mb-2" />
                                <span className="text-2xl font-heading font-black">{s.val}</span>
                                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mt-1">{s.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Inbox Health Card */}
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 mb-10">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">System Hygiene</span>
                            <span className="text-xl font-heading font-black text-emerald-500">{stats.inboxHealthScore}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-emerald-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.inboxHealthScore}%` }}
                                transition={{ delay: 0.5, duration: 1 }}
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-4 bg-emerald-500 text-black rounded-full font-bold hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
                        >
                            Continue
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onSetupAutomation}
                            className="flex-1 px-6 py-4 border border-zinc-800 text-zinc-400 rounded-full font-bold hover:text-white hover:bg-zinc-900 transition-all"
                        >
                            Dashboard
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
