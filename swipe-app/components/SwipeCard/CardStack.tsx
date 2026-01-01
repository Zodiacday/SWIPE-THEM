/**
 * CardStack Component
 * Reference: Page 9 — SWIPE UI (Section 9.2)
 *
 * Manages the 3-card stack using BufferItems
 */

"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SwipeCard } from "./SwipeCard";
import type { NormalizedEmail, SwipeAction } from "@/lib/types";
import { BufferItem } from "@/lib/engines/buffer";

interface CardStackProps {
    items: BufferItem[];
    onSwipe: (email: NormalizedEmail, action: SwipeAction) => void;
    onLongPress?: (email: NormalizedEmail) => void;
}

export function CardStack({
    items,
    onSwipe,
    onLongPress,
}: CardStackProps) {
    const [exitingCard, setExitingCard] = useState<{
        email: NormalizedEmail;
        action: SwipeAction;
    } | null>(null);

    // With the buffer, we ALWAYS look at the first few items
    const visibleCards = items
        .slice(0, 3)
        .map((item, index) => ({
            item,
            stackPosition: index as 0 | 1 | 2,
        }));

    // Handle swipe action
    const handleSwipe = useCallback(
        (action: SwipeAction) => {
            const currentItem = items[0];
            if (!currentItem) return;

            // Set exiting card for animation
            setExitingCard({ email: currentItem.email, action });

            // Call onSwipe callback
            onSwipe(currentItem.email, action);

            // Re-sync happens in parent after consume()
            setTimeout(() => {
                setExitingCard(null);
            }, 120);
        },
        [items, onSwipe]
    );

    // Handle long press for domain nuke
    const handleLongPress = useCallback(() => {
        const currentItem = items[0];
        if (currentItem && onLongPress) {
            onLongPress(currentItem.email);
        }
    }, [items, onLongPress]);

    // Get exit animation based on action
    const getExitAnimation = (action: SwipeAction) => {
        switch (action) {
            case "delete":
                return { x: -500, rotate: -15, opacity: 0 };
            case "unsubscribe":
                return { x: 500, rotate: 15, opacity: 0 };
            case "block":
                return { y: -500, opacity: 0 };
            case "keep":
                return { y: 500, opacity: 0 };
            case "nuke":
                return { scale: 1.5, opacity: 0 };
            default:
                return { opacity: 0 };
        }
    };

    if (visibleCards.length === 0 && !exitingCard) {
        return null;
    }

    return (
        <div className="relative w-full h-[480px] flex items-center justify-center">
            <AnimatePresence mode="popLayout">
                {/* Exiting card animation */}
                {exitingCard && (
                    <motion.div
                        key={`exit-${exitingCard.email.id}`}
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
                        animate={getExitAnimation(exitingCard.action)}
                        exit={{ opacity: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                            duration: 0.12,
                        }}
                        style={{ zIndex: 40 }}
                    >
                        <div className="w-80 bg-[#18181b] border border-white/10 rounded-[2rem] p-6 min-h-[420px] shadow-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                                    <div className="w-6 h-6 bg-emerald-500 rounded-lg animate-pulse" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="h-4 w-24 bg-zinc-800 rounded mb-2" />
                                    <div className="h-3 w-32 bg-zinc-900 rounded" />
                                </div>
                            </div>
                            <div className="h-6 w-full bg-zinc-800 rounded mb-3" />
                            <div className="h-24 w-full bg-zinc-900/50 rounded" />
                        </div>
                    </motion.div>
                )}

                {/* Visible cards (reversed for proper z-index stacking) */}
                {[...visibleCards].reverse().map(({ item, stackPosition }) => (
                    <SwipeCard
                        key={item.email.id}
                        email={item.email}
                        onSwipe={handleSwipe}
                        onLongPress={handleLongPress}
                        isActive={stackPosition === 0 && !exitingCard}
                        stackPosition={stackPosition}
                        isBoss={item.isBossField}
                        groupCount={item.groupCount}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}

export { SwipeCard };
