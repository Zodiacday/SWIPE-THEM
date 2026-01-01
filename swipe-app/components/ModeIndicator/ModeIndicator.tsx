/**
 * Mode Indicator Component
 * Reference: Page 10 — GAMIFICATION (Section 10.5)
 * 
 * Zen Mode: Slow steady swipes, calm actions
 * Rage Mode: Rapid deletes, aggressive clearing
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Flame } from "lucide-react";

type Mode = "zen" | "rage" | null;

interface ModeIndicatorProps {
    mode: Mode;
    intensity: number; // 0-100
}

export function ModeIndicator({ mode, intensity }: ModeIndicatorProps) {
    if (!mode) return null;

    const isZen = mode === "zen";

    return (
        <AnimatePresence>
            <motion.div
                className="fixed top-32 left-1/2 -translate-x-1/2 z-30"
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
            >
                <motion.div
                    className={`relative px-8 py-4 rounded-full ${isZen
                            ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50"
                            : "bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-orange-400/50"
                        } backdrop-blur-md`}
                    animate={{
                        boxShadow: isZen
                            ? [
                                "0 0 20px rgba(34, 211, 238, 0.3)",
                                "0 0 40px rgba(34, 211, 238, 0.5)",
                                "0 0 20px rgba(34, 211, 238, 0.3)",
                            ]
                            : [
                                "0 0 20px rgba(249, 115, 22, 0.5)",
                                "0 0 40px rgba(249, 115, 22, 0.8)",
                                "0 0 20px rgba(249, 115, 22, 0.5)",
                            ],
                    }}
                    transition={{ duration: isZen ? 3 : 0.5, repeat: Infinity }}
                >
                    <div className="flex items-center gap-4">
                        {/* Icon */}
                        <motion.div
                            animate={
                                isZen
                                    ? {
                                        rotate: [0, 360],
                                        scale: [1, 1.1, 1],
                                    }
                                    : {
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 5, -5, 0],
                                    }
                            }
                            transition={{
                                duration: isZen ? 4 : 0.3,
                                repeat: Infinity,
                            }}
                        >
                            {isZen ? (
                                <Sparkles className="w-8 h-8 text-cyan-400" />
                            ) : (
                                <Flame className="w-8 h-8 text-orange-500" />
                            )}
                        </motion.div>

                        {/* Text */}
                        <div>
                            <h3
                                className={`text-2xl font-black uppercase tracking-wider ${isZen ? "text-cyan-400" : "text-orange-500"
                                    }`}
                            >
                                {isZen ? "Zen Flow" : "Rage Mode"}
                            </h3>
                            <p
                                className={`text-sm font-medium ${isZen ? "text-cyan-300/80" : "text-orange-400/80"
                                    }`}
                            >
                                {isZen ? "Calm & Focused" : "Maximum Power"}
                            </p>
                        </div>

                        {/* Intensity Bar */}
                        <div className="ml-4">
                            <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full ${isZen
                                            ? "bg-gradient-to-r from-cyan-400 to-blue-500"
                                            : "bg-gradient-to-r from-orange-500 to-red-600"
                                        }`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${intensity}%` }}
                                    transition={{ type: "spring", stiffness: 100 }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Particle effects */}
                    {!isZen && (
                        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
                            {[...Array(8)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-1 h-1 bg-orange-400 rounded-full"
                                    initial={{
                                        x: "50%",
                                        y: "50%",
                                        opacity: 1,
                                    }}
                                    animate={{
                                        x: `${50 + (Math.random() - 0.5) * 100}%`,
                                        y: `${50 + (Math.random() - 0.5) * 100}%`,
                                        opacity: 0,
                                    }}
                                    transition={{
                                        duration: 0.5,
                                        delay: i * 0.1,
                                        repeat: Infinity,
                                        repeatDelay: 0.5,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

/**
 * Hook to detect and manage Zen/Rage modes
 */
export function useModeDetection() {
    const [mode, setMode] = React.useState<Mode>(null);
    const [intensity, setIntensity] = React.useState(0);
    const [swipeHistory, setSwipeHistory] = React.useState<{
        action: string;
        timestamp: number;
    }[]>([]);

    const addSwipe = (action: string) => {
        const now = Date.now();
        const newHistory = [
            ...swipeHistory.filter((s) => now - s.timestamp < 10000), // Keep last 10 seconds
            { action, timestamp: now },
        ];
        setSwipeHistory(newHistory);

        // Detect Zen Mode: Slow, steady swipes with variety
        const recentSwipes = newHistory.filter((s) => now - s.timestamp < 5000);
        if (recentSwipes.length >= 3 && recentSwipes.length <= 6) {
            const actionVariety = new Set(recentSwipes.map((s) => s.action)).size;
            if (actionVariety >= 2) {
                setMode("zen");
                setIntensity(Math.min(100, (recentSwipes.length / 6) * 100));
                return;
            }
        }

        // Detect Rage Mode: Rapid deletes
        const rapidDeletes = newHistory.filter(
            (s) => s.action === "delete" && now - s.timestamp < 3000
        );
        if (rapidDeletes.length >= 5) {
            setMode("rage");
            setIntensity(Math.min(100, (rapidDeletes.length / 10) * 100));
            return;
        }

        // Reset mode if conditions not met
        if (recentSwipes.length === 0) {
            setMode(null);
            setIntensity(0);
        }
    };

    return { mode, intensity, addSwipe };
}

// Add React import
import React from "react";
