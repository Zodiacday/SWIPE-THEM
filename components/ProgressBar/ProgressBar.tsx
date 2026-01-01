/**
 * ProgressBar Component
 * Reference: Page 9 — SWIPE UI (Section 9.8)
 *
 * Horizontal progress bar showing:
 * - Emails processed
 * - Emails remaining
 * - Session progress
 */

"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
    processed: number;
    total: number;
    isCombo?: boolean;
    comboLevel?: number;
}

export function ProgressBar({
    processed,
    total,
    isCombo = false,
    comboLevel = 0,
}: ProgressBarProps) {
    const progress = total > 0 ? (processed / total) * 100 : 0;

    // Get glow effect based on combo level
    const getComboGlow = () => {
        if (!isCombo) return "none";
        switch (comboLevel) {
            case 1:
                return "0 0 10px rgba(59, 130, 246, 0.5)";
            case 2:
                return "0 0 15px rgba(139, 92, 246, 0.6)";
            case 3:
                return "0 0 20px rgba(236, 72, 153, 0.7)";
            default:
                return "0 0 25px rgba(249, 115, 22, 0.8)";
        }
    };

    // Get combo gradient
    const getComboGradient = () => {
        if (!isCombo) return "linear-gradient(90deg, #3b82f6, #60a5fa)";
        switch (comboLevel) {
            case 1:
                return "linear-gradient(90deg, #3b82f6, #8b5cf6)";
            case 2:
                return "linear-gradient(90deg, #8b5cf6, #ec4899)";
            case 3:
                return "linear-gradient(90deg, #ec4899, #f97316)";
            default:
                return "linear-gradient(90deg, #f97316, #ef4444, #ec4899)";
        }
    };

    return (
        <div className="w-full px-4">
            {/* Progress info */}
            <div className="flex justify-between items-center mb-2 text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                    {processed} of {total} emails
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                    {Math.round(progress)}%
                </span>
            </div>

            {/* Progress bar container */}
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                {/* Progress fill */}
                <motion.div
                    className="h-full rounded-full"
                    style={{
                        background: getComboGradient(),
                        boxShadow: getComboGlow(),
                    }}
                    initial={{ width: 0 }}
                    animate={{
                        width: `${progress}%`,
                        scale: isCombo ? [1, 1.02, 1] : 1,
                    }}
                    transition={{
                        width: { type: "spring", stiffness: 400, damping: 30 },
                        scale: { duration: 0.3, repeat: isCombo ? Infinity : 0, repeatDelay: 0.5 },
                    }}
                />
            </div>

            {/* Combo indicator */}
            {isCombo && comboLevel > 0 && (
                <motion.div
                    className="flex justify-center mt-2"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                >
                    <span
                        className="px-3 py-1 rounded-full text-xs font-bold text-white"
                        style={{
                            background: getComboGradient(),
                            boxShadow: getComboGlow(),
                        }}
                    >
                        Combo x{comboLevel}!
                    </span>
                </motion.div>
            )}
        </div>
    );
}
