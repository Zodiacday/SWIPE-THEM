/**
 * UndoSnackbar Component
 * Reference: Page 9 — SWIPE UI (Section 9.7)
 *
 * Snackbar for undo actions:
 * - Appears bottom center
 * - Duration: 3 seconds
 * - Contains: action icon, "Undo" button, description
 */

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, MailX, Ban, Check, Bomb, Undo2 } from "lucide-react";
import type { SwipeAction } from "@/lib/types";

interface UndoAction {
    id: string;
    action: SwipeAction;
    description: string;
    undoToken: string;
    timestamp: number;
}

interface UndoSnackbarProps {
    undoAction: UndoAction | null;
    onUndo: (undoToken: string) => void;
    onDismiss: () => void;
    duration?: number; // ms
}

export function UndoSnackbar({
    undoAction,
    onUndo,
    onDismiss,
    duration = 3000,
}: UndoSnackbarProps) {
    const [progress, setProgress] = useState(100);

    // Auto-dismiss after duration
    useEffect(() => {
        if (!undoAction) return;

        setProgress(100);
        const startTime = Date.now();

        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(remaining);

            if (remaining <= 0) {
                clearInterval(interval);
                onDismiss();
            }
        }, 50);

        return () => clearInterval(interval);
    }, [undoAction, duration, onDismiss]);

    // Get action icon
    const getActionIcon = (action: SwipeAction) => {
        switch (action) {
            case "delete":
                return <Trash2 size={18} />;
            case "unsubscribe":
                return <MailX size={18} />;
            case "block":
                return <Ban size={18} />;
            case "keep":
                return <Check size={18} />;
            case "nuke":
                return <Bomb size={18} />;
        }
    };

    // Get action color
    const getActionColor = (action: SwipeAction) => {
        switch (action) {
            case "delete":
                return "bg-red-500";
            case "unsubscribe":
                return "bg-blue-500";
            case "block":
                return "bg-orange-500";
            case "keep":
                return "bg-green-500";
            case "nuke":
                return "bg-red-700";
        }
    };

    return (
        <AnimatePresence>
            {undoAction && (
                <motion.div
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                    <div className="relative bg-gray-900 dark:bg-gray-800 text-white rounded-xl shadow-2xl overflow-hidden">
                        {/* Progress bar */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700">
                            <motion.div
                                className="h-full bg-blue-500"
                                initial={{ width: "100%" }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.05 }}
                            />
                        </div>

                        <div className="flex items-center gap-4 px-4 py-3 pt-4">
                            {/* Action icon */}
                            <div
                                className={`p-2 rounded-full ${getActionColor(
                                    undoAction.action
                                )} text-white`}
                            >
                                {getActionIcon(undoAction.action)}
                            </div>

                            {/* Description */}
                            <p className="text-sm font-medium min-w-[150px]">
                                {undoAction.description}
                            </p>

                            {/* Undo button */}
                            <button
                                onClick={() => onUndo(undoAction.undoToken)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium"
                            >
                                <Undo2 size={16} />
                                Undo
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
