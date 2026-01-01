/**
 * ComboCounter Component
 * Reference: Page 9 — SWIPE UI (Section 9.9)
 * Reference: Page 10 — GAMIFICATION (Section 10.3)
 *
 * Displays combo counter with effects:
 * - 3 swipes in < 2 seconds → Combo 1
 * - 6 swipes → Combo 2
 * - 10 swipes → Combo 3
 * - 20+ swipes → Ultra Combo
 */

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Flame } from "lucide-react";

interface ComboCounterProps {
    comboCount: number;
    lastSwipeTime: number;
}

const COMBO_TIMEOUT = 2000; // 2 seconds between swipes

export function ComboCounter({ comboCount, lastSwipeTime }: ComboCounterProps) {
    const [showCombo, setShowCombo] = useState(false);
    const [comboLevel, setComboLevel] = useState(0);

    // Calculate combo level
    useEffect(() => {
        let level = 0;
        if (comboCount >= 20) {
            level = 4; // Ultra
        } else if (comboCount >= 10) {
            level = 3;
        } else if (comboCount >= 6) {
            level = 2;
        } else if (comboCount >= 3) {
            level = 1;
        }
        setComboLevel(level);
        setShowCombo(level > 0);
    }, [comboCount]);

    // Auto-hide combo after timeout
    useEffect(() => {
        if (!showCombo) return;

        const timer = setTimeout(() => {
            setShowCombo(false);
        }, COMBO_TIMEOUT);

        return () => clearTimeout(timer);
    }, [lastSwipeTime, showCombo]);

    // Get combo style based on level
    const getComboStyle = () => {
        switch (comboLevel) {
            case 1:
                return {
                    gradient: "from-blue-500 to-cyan-500",
                    text: "COMBO",
                    icon: Zap,
                    scale: 1,
                };
            case 2:
                return {
                    gradient: "from-purple-500 to-pink-500",
                    text: "COMBO",
                    icon: Zap,
                    scale: 1.1,
                };
            case 3:
                return {
                    gradient: "from-orange-500 to-red-500",
                    text: "MEGA COMBO",
                    icon: Flame,
                    scale: 1.2,
                };
            case 4:
                return {
                    gradient: "from-red-600 to-pink-600",
                    text: "ULTRA COMBO",
                    icon: Flame,
                    scale: 1.3,
                };
            default:
                return null;
        }
    };

    const style = getComboStyle();

    return (
        <AnimatePresence>
            {showCombo && style && (
                <motion.div
                    className="fixed top-24 left-1/2 -translate-x-1/2 z-40"
                    initial={{ y: -50, opacity: 0, scale: 0.5 }}
                    animate={{ y: 0, opacity: 1, scale: style.scale }}
                    exit={{ y: -20, opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                    <motion.div
                        className={`flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r ${style.gradient} text-white shadow-2xl`}
                        animate={{
                            boxShadow: [
                                "0 10px 40px rgba(0,0,0,0.3)",
                                "0 10px 60px rgba(0,0,0,0.4)",
                                "0 10px 40px rgba(0,0,0,0.3)",
                            ],
                        }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                    >
                        <motion.div
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 0.2 }}
                        >
                            <style.icon size={28} className="drop-shadow-lg" />
                        </motion.div>

                        <div className="flex flex-col items-center">
                            <span className="text-xs font-semibold opacity-80">
                                {style.text}
                            </span>
                            <motion.span
                                className="text-3xl font-black"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 0.3 }}
                            >
                                x{comboCount}
                            </motion.span>
                        </div>

                        <motion.div
                            animate={{ rotate: [0, -15, 15, 0] }}
                            transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 0.2 }}
                        >
                            <style.icon size={28} className="drop-shadow-lg" />
                        </motion.div>
                    </motion.div>

                    {/* Particle effects */}
                    {comboLevel >= 3 && (
                        <div className="absolute inset-0 pointer-events-none">
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-2 h-2 rounded-full bg-yellow-400"
                                    initial={{
                                        x: 0,
                                        y: 0,
                                        opacity: 1,
                                    }}
                                    animate={{
                                        x: (Math.random() - 0.5) * 100,
                                        y: (Math.random() - 0.5) * 100,
                                        opacity: 0,
                                    }}
                                    transition={{
                                        duration: 0.5,
                                        delay: i * 0.1,
                                        repeat: Infinity,
                                        repeatDelay: 0.5,
                                    }}
                                    style={{
                                        left: "50%",
                                        top: "50%",
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/**
 * Hook to manage combo state
 */
export function useCombo() {
    const [comboCount, setComboCount] = useState(0);
    const [lastSwipeTime, setLastSwipeTime] = useState(0);

    const addSwipe = () => {
        const now = Date.now();
        if (now - lastSwipeTime < COMBO_TIMEOUT) {
            setComboCount((prev) => prev + 1);
        } else {
            setComboCount(1);
        }
        setLastSwipeTime(now);
    };

    const resetCombo = () => {
        setComboCount(0);
    };

    // Auto-reset combo after timeout
    useEffect(() => {
        if (comboCount === 0) return;

        const timer = setTimeout(() => {
            setComboCount(0);
        }, COMBO_TIMEOUT);

        return () => clearTimeout(timer);
    }, [lastSwipeTime, comboCount]);

    return {
        comboCount,
        lastSwipeTime,
        addSwipe,
        resetCombo,
        comboLevel:
            comboCount >= 20 ? 4 : comboCount >= 10 ? 3 : comboCount >= 6 ? 2 : comboCount >= 3 ? 1 : 0,
        isCombo: comboCount >= 3,
    };
}
