/**
 * SwipeCard Component - Obsidian Mint Edition
 */

"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Trash2, MailX, Ban, Check, Bomb, Mail, Skull } from "lucide-react";
import { NormalizedEmail, SwipeAction } from "@/lib/types";

interface SwipeCardProps {
    email: NormalizedEmail;
    onSwipe: (action: SwipeAction) => void;
    onLongPress?: (email: NormalizedEmail) => void;
    isActive: boolean;
    stackPosition: number;
    isBoss?: boolean;
    groupCount?: number;
}

export function SwipeCard({
    email,
    onSwipe,
    onLongPress,
    isActive,
    stackPosition,
    isBoss,
    groupCount,
}: SwipeCardProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(
        null
    );

    // Motion values for drag
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Calculate card dimensions
    const cardWidth = 320;
    const cardHeight = 420;
    const horizontalThreshold = cardWidth * 0.25;
    const verticalThreshold = cardHeight * 0.2;

    // Transform rotation based on horizontal drag
    const rotate = useTransform(x, [-cardWidth, 0, cardWidth], [-8, 0, 8]);
    const opacity = useTransform(x, [-cardWidth, -horizontalThreshold, 0, horizontalThreshold, cardWidth], [0.5, 1, 1, 1, 0.5]);

    // Action feedback transforms
    const deleteOpacity = useTransform(x, [-horizontalThreshold, -horizontalThreshold / 2], [1, 0]);
    const unsubOpacity = useTransform(x, [horizontalThreshold / 2, horizontalThreshold], [0, 1]);
    const blockOpacity = useTransform(y, [-verticalThreshold, -verticalThreshold / 2], [1, 0]);
    const keepOpacity = useTransform(y, [verticalThreshold / 2, verticalThreshold], [0, 1]);

    // Dynamic background bleed based on direction
    const cardBgOverlay = useTransform(
        [x, y],
        ([latestX, latestY]: any[]) => {
            const absX = Math.abs(latestX);
            const absY = Math.abs(latestY);
            if (absX < 20 && absY < 20) return "rgba(0,0,0,0)";

            if (absX > absY) {
                // Horizontal dominant
                const opacity = Math.min(absX / (cardWidth * 0.4), 0.2);
                return latestX < 0
                    ? `rgba(239, 68, 68, ${opacity})` // red
                    : `rgba(59, 130, 246, ${opacity})`; // blue
            } else {
                // Vertical dominant
                const opacity = Math.min(absY / (cardHeight * 0.4), 0.2);
                return latestY < 0
                    ? `rgba(249, 115, 22, ${opacity})` // orange
                    : `rgba(16, 185, 129, ${opacity})`; // emerald
            }
        }
    );

    const handleDragStart = () => {
        setIsDragging(true);
        // Clear long press on drag start
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }
    };

    const handleDragEnd = (_: any, info: any) => {
        setIsDragging(false);
        const { offset, velocity } = info;

        // Determine if swipe should complete based on threshold or velocity
        const swipeRight =
            offset.x > horizontalThreshold || velocity.x > 500;
        const swipeLeft =
            offset.x < -horizontalThreshold || velocity.x < -500;
        const swipeUp =
            offset.y < -verticalThreshold || velocity.y < -500;
        const swipeDown =
            offset.y > verticalThreshold || velocity.y > 500;

        if (swipeLeft) {
            onSwipe("delete");
        } else if (swipeRight) {
            onSwipe("unsubscribe");
        } else if (swipeUp) {
            onSwipe("block");
        } else if (swipeDown) {
            onSwipe("keep");
        }
    };

    const handlePointerDown = () => {
        if (!isActive) return;
        const timer = setTimeout(() => {
            if (onLongPress) {
                onLongPress(email);
                // Visual/Haptic feedback for Nuke
                if (window.navigator.vibrate) window.navigator.vibrate(100);
            }
        }, 600);
        setLongPressTimer(timer);
    };

    const handlePointerUp = () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }
    };

    return (
        <motion.div
            className="absolute inset-0 flex items-center justify-center select-none"
            style={{
                zIndex: 30 - stackPosition,
                scale: 1 - stackPosition * 0.05,
                y: stackPosition * 10,
                x: 0,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
                opacity: 1,
                scale: 1 - stackPosition * 0.05,
                y: stackPosition * 10,
            }}
            exit={{ opacity: 0, scale: 0.5 }}
        >
            <motion.div
                drag={isActive}
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.8}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                style={{
                    x,
                    y,
                    rotate,
                    opacity: isActive ? 1 : 0.6,
                }}
                className={`relative w-80 h-[460px] glass border-zinc-800 rounded-[2rem] p-6 shadow-2xl flex flex-col justify-between transition-all duration-300 ${isActive ? 'cursor-grab active:cursor-grabbing border-zinc-700' : ''}`}
            >
                {/* Dynamic Background Bleed */}
                <motion.div
                    style={{ backgroundColor: cardBgOverlay }}
                    className="absolute inset-0 rounded-[2rem] pointer-events-none z-0"
                />
                {/* Action Overlays */}
                <motion.div
                    style={{ opacity: deleteOpacity }}
                    className="absolute inset-0 bg-red-500/10 rounded-[2rem] flex items-center justify-center pointer-events-none border-2 border-red-500/20"
                >
                    <Trash2 className="w-20 h-20 text-red-500 opacity-40" />
                </motion.div>
                <motion.div
                    style={{ opacity: unsubOpacity }}
                    className="absolute inset-0 bg-blue-500/10 rounded-[2rem] flex items-center justify-center pointer-events-none border-2 border-blue-500/20"
                >
                    <MailX className="w-20 h-20 text-blue-500 opacity-40" />
                </motion.div>
                <motion.div
                    style={{ opacity: blockOpacity }}
                    className="absolute inset-0 bg-orange-500/10 rounded-[2rem] flex items-center justify-center pointer-events-none border-2 border-orange-500/20"
                >
                    <Ban className="w-20 h-20 text-orange-500 opacity-40" />
                </motion.div>
                <motion.div
                    style={{ opacity: keepOpacity }}
                    className="absolute inset-0 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center pointer-events-none border-2 border-emerald-500/20"
                >
                    <Check className="w-20 h-20 text-emerald-500 opacity-40" />
                </motion.div>

                {/* Card Content */}
                <div className="relative z-10 flex-1 flex flex-col">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${isBoss ? 'bg-red-500/10 border-red-500/40' : 'bg-zinc-900 border-zinc-800'}`}>
                                {isBoss ? (
                                    <Skull className="w-6 h-6 text-red-500" />
                                ) : (
                                    <Mail className="w-6 h-6 text-emerald-500" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <h3 className={`text-lg font-heading font-bold truncate ${isBoss ? 'text-red-400' : 'text-white'}`}>
                                    {isBoss ? 'Multi-Email Boss' : (email.senderName || email.sender.split('@')[0])}
                                </h3>
                                <p className="text-xs text-zinc-500 font-medium truncate italic">
                                    {isBoss ? `${groupCount} similar emails detected` : email.sender}
                                </p>
                            </div>
                        </div>
                        <div className={`h-[1px] w-full ${isBoss ? 'bg-red-500/20' : 'bg-zinc-800'}`} />
                    </div>

                    {/* Subject & Preview */}
                    <div className="flex-1 space-y-3">
                        <h2 className="text-xl font-heading font-black leading-tight text-white line-clamp-2">
                            {email.subject}
                        </h2>
                        <div className="relative">
                            {/* "Information Start" - Added extra density and better alignment */}
                            <p className="text-[13px] text-zinc-400 font-medium leading-relaxed line-clamp-6">
                                <span className="text-emerald-500/80 font-bold uppercase text-[9px] tracking-widest block mb-1">Snippet Preview</span>
                                {email.preview}
                            </p>
                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#09090b] to-transparent pointer-events-none" />
                        </div>
                    </div>

                    {/* Footer / Meta */}
                    <div className="mt-6 flex items-center justify-between">
                        <div className="flex gap-1.5 flex-wrap">
                            {email.labels.slice(0, 2).map((label) => (
                                <span key={label} className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded-md text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                                    {label}
                                </span>
                            ))}
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-600">
                            {email.receivedAt}
                        </span>
                    </div>
                </div>

                {/* Interaction Hint (Bottom) */}
                {isActive && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-20 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-1 bg-zinc-800 rounded-full" />
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
