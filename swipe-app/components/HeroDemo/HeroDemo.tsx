/**
 * HeroDemo Component - Fixed for Interactive Swiping
 * A functional, interactive mini-demo for the landing page hero.
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { NormalizedEmail, SwipeAction } from "@/lib/types";
import { Zap, Trophy, Mail, Trash2, MailX, Ban, Check } from "lucide-react";

const DEMO_EMAILS: NormalizedEmail[] = [
    {
        id: "demo-1",
        provider: "gmail",
        providerId: "p1",
        sender: "newsletter@marketing.ai",
        senderName: "Marketing AI Weekly",
        senderDomain: "marketing.ai",
        subject: "Your Daily Dose of Hype 🚀",
        preview: "In today's edition, we explore why you should definitely buy our latest tool. It's game-changing!",
        receivedAt: "1h ago",
        timestamp: Date.now(),
        labels: ["PROMOTIONS"],
        category: "promo",
        isRead: false,
        size: 1024,
        listUnsubscribe: { http: "https://example.com/unsub", mailto: null },
        metadata: {},
        headers: {}
    },
    {
        id: "demo-2",
        provider: "gmail",
        providerId: "p2",
        sender: "updates@social-app.com",
        senderName: "Social App Inbox",
        senderDomain: "social-app.com",
        subject: "Someone you don't know tagged you",
        preview: "Check out this photo of a cat that looks vaguely like toast. Everyone is talking about it!",
        receivedAt: "3h ago",
        timestamp: Date.now(),
        labels: ["SOCIAL"],
        category: "social",
        isRead: false,
        size: 512,
        listUnsubscribe: { http: "https://example.com/unsub", mailto: null },
        metadata: {},
        headers: {}
    },
    {
        id: "demo-3",
        provider: "gmail",
        providerId: "p3",
        sender: "no-reply@spam-central.net",
        senderName: "Spam Lord",
        senderDomain: "spam-central.net",
        subject: "URGENT: Your account exists",
        preview: "This is a very important message to tell you that your email address is functional.",
        receivedAt: "5h ago",
        timestamp: Date.now(),
        labels: ["SPAM"],
        category: "promo",
        isRead: false,
        size: 2048,
        listUnsubscribe: { http: "https://example.com/unsub", mailto: null },
        metadata: {},
        headers: {}
    }
];

// Simplified swipeable card for hero demo
function HeroCard({
    email,
    onSwipe,
    isActive
}: {
    email: NormalizedEmail;
    onSwipe: (action: SwipeAction) => void;
    isActive: boolean;
}) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);

    // Dynamic overlays based on drag direction
    const deleteOpacity = useTransform(x, [-100, -50], [1, 0]);
    const unsubOpacity = useTransform(x, [50, 100], [0, 1]);
    const blockOpacity = useTransform(y, [-100, -50], [1, 0]);
    const keepOpacity = useTransform(y, [50, 100], [0, 1]);

    const handleDragEnd = (_: any, info: any) => {
        const threshold = 80;
        const { offset } = info;

        if (offset.x < -threshold) {
            onSwipe("delete");
        } else if (offset.x > threshold) {
            onSwipe("unsubscribe");
        } else if (offset.y < -threshold) {
            onSwipe("block");
        } else if (offset.y > threshold) {
            onSwipe("keep");
        }
    };

    return (
        <motion.div
            drag={isActive}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.9}
            onDragEnd={handleDragEnd}
            style={{ x, y, rotate }}
            className={`absolute inset-0 w-72 h-96 glass border-zinc-800 rounded-[2rem] p-5 shadow-2xl flex flex-col ${isActive ? 'cursor-grab active:cursor-grabbing z-30' : 'z-20'}`}
            whileDrag={{ scale: 1.02 }}
        >
            {/* Action Overlays */}
            <motion.div style={{ opacity: deleteOpacity }} className="absolute inset-0 bg-red-500/20 rounded-[2rem] flex items-center justify-center pointer-events-none">
                <Trash2 className="w-16 h-16 text-red-500 opacity-60" />
            </motion.div>
            <motion.div style={{ opacity: unsubOpacity }} className="absolute inset-0 bg-blue-500/20 rounded-[2rem] flex items-center justify-center pointer-events-none">
                <MailX className="w-16 h-16 text-blue-500 opacity-60" />
            </motion.div>
            <motion.div style={{ opacity: blockOpacity }} className="absolute inset-0 bg-orange-500/20 rounded-[2rem] flex items-center justify-center pointer-events-none">
                <Ban className="w-16 h-16 text-orange-500 opacity-60" />
            </motion.div>
            <motion.div style={{ opacity: keepOpacity }} className="absolute inset-0 bg-emerald-500/20 rounded-[2rem] flex items-center justify-center pointer-events-none">
                <Check className="w-16 h-16 text-emerald-500 opacity-60" />
            </motion.div>

            {/* Card Content */}
            <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white truncate">{email.senderName}</h3>
                        <p className="text-[10px] text-zinc-500 truncate">{email.sender}</p>
                    </div>
                </div>

                <div className="h-[1px] w-full bg-zinc-800 mb-4" />

                <h2 className="text-lg font-heading font-black text-white mb-2 line-clamp-2">{email.subject}</h2>
                <p className="text-xs text-zinc-400 line-clamp-4 flex-1">{email.preview}</p>

                <div className="flex items-center gap-2 mt-4">
                    <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[8px] uppercase font-bold text-zinc-500">
                        {email.labels[0]}
                    </span>
                    <span className="text-[10px] text-zinc-600">{email.receivedAt}</span>
                </div>
            </div>
        </motion.div>
    );
}

export function HeroDemo() {
    const [emails, setEmails] = useState<NormalizedEmail[]>(DEMO_EMAILS);
    const [lastAction, setLastAction] = useState<{ type: SwipeAction; label: string } | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSwipe = useCallback((action: SwipeAction) => {
        const labels: Record<string, string> = {
            delete: "Trashed",
            unsubscribe: "Unsubscribed",
            block: "Blocked",
            keep: "Kept"
        };

        setLastAction({ type: action, label: labels[action] || action });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);

        // Remove the top card
        setEmails(prev => prev.slice(1));
    }, []);

    // Loop logic: Refill when empty
    useEffect(() => {
        if (emails.length === 0) {
            const timer = setTimeout(() => {
                setEmails(DEMO_EMAILS);
                setLastAction(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [emails]);

    return (
        <div className="relative w-full h-[500px] flex items-center justify-center">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-emerald-500/5 blur-[80px] rounded-full scale-150 pointer-events-none" />

            <AnimatePresence mode="popLayout">
                {emails.length > 0 ? (
                    <div className="relative w-72 h-96">
                        {emails.slice(0, 3).map((email, index) => (
                            <motion.div
                                key={email.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1 - index * 0.05,
                                    y: index * 8,
                                    zIndex: 30 - index
                                }}
                                exit={{
                                    x: lastAction?.type === 'delete' ? -300 : lastAction?.type === 'unsubscribe' ? 300 : 0,
                                    y: lastAction?.type === 'block' ? -300 : lastAction?.type === 'keep' ? 300 : 0,
                                    opacity: 0,
                                    rotate: lastAction?.type === 'delete' ? -15 : lastAction?.type === 'unsubscribe' ? 15 : 0
                                }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0"
                            >
                                <HeroCard
                                    email={email}
                                    onSwipe={handleSwipe}
                                    isActive={index === 0}
                                />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="glass border-zinc-800 rounded-[2.5rem] p-10 flex flex-col items-center text-center max-w-[320px] shadow-2xl"
                    >
                        <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                            <Trophy className="w-8 h-8 text-black fill-current" />
                        </div>
                        <h3 className="text-xl font-heading font-black text-white mb-2">Inbox Zen!</h3>
                        <p className="text-sm text-zinc-400 font-medium mb-6">You've cleared the demo stack. Ready for your real inbox?</p>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-500/60 animate-pulse">
                            Refilling Stack...
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Notification */}
            <AnimatePresence>
                {showSuccess && lastAction && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-emerald-500/20 rounded-full shadow-2xl backdrop-blur-md"
                    >
                        <Zap className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                            {lastAction.label}!
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Instruction Tip */}
            {emails.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
                >
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Swipe to try</div>
                    <div className="flex gap-4">
                        <span className="text-[8px] text-zinc-600">← Trash</span>
                        <span className="text-[8px] text-zinc-600">→ Unsub</span>
                        <span className="text-[8px] text-zinc-600">↑ Block</span>
                        <span className="text-[8px] text-zinc-600">↓ Keep</span>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
