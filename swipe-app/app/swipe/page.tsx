/**
 * Obsidian Mint Redesigned Swipe Page
 * Focus: Professional, data-driven, clean gamification
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Settings,
    Flame,
    Crown,
    Target,
    Zap,
    Trash2,
    MailX,
    Ban,
    Check,
    LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { CardStack } from "@/components/SwipeCard/CardStack";
import { ModeIndicator } from "@/components/ModeIndicator/ModeIndicator";
import { ComboCounter } from "@/components/ComboCounter/ComboCounter";
import { UndoSnackbar } from "@/components/UndoSnackbar/UndoSnackbar";
import { BossFight } from "@/components/BossFight/BossFight";
import { VictoryScreen } from "@/components/VictoryScreen/VictoryScreen";
import { Particles, Meteors } from "@/components/ui";
import { NormalizedEmail, SwipeAction } from "@/lib/types";

const DEMO_EMAILS: NormalizedEmail[] = [
    {
        id: "1",
        provider: "imap",
        providerId: "demo-1",
        sender: "newsletter@dailytech.com",
        senderName: "Daily Tech News",
        senderDomain: "dailytech.com",
        subject: "The Future of AI is Swiping",
        preview: "In this edition, we explore how gesture-based interfaces are revolutionizing productivity...",
        receivedAt: new Date().toISOString(),
        timestamp: Date.now(),
        listUnsubscribe: { http: "https://dailytech.com/unsub", mailto: null },
        category: "newsletter",
        labels: ["newsletter", "tech"],
        isRead: false,
        size: 1024,
        metadata: {},
        headers: {},
    },
    {
        id: "2",
        provider: "imap",
        providerId: "demo-2",
        sender: "deals@megapromo.net",
        senderName: "Mega Promo",
        senderDomain: "megapromo.net",
        subject: "🔥 90% OFF EVERYTHING!",
        preview: "Don't miss our biggest sale of the year. Act now and save big on all categories!",
        receivedAt: new Date().toISOString(),
        timestamp: Date.now() - 3600000,
        listUnsubscribe: { http: null, mailto: "mailto:unsub@megapromo.net" },
        category: "promo",
        labels: ["promo", "sales"],
        isRead: false,
        size: 2048,
        metadata: {},
        headers: {},
    },
    {
        id: "3",
        provider: "imap",
        providerId: "demo-3",
        sender: "notifs@linkdin-social.com",
        senderName: "LinkdIn Update",
        senderDomain: "linkdin-social.com",
        subject: "You have 15 new profile views",
        preview: "See who's looking at your profile and expand your professional network today...",
        receivedAt: new Date().toISOString(),
        timestamp: Date.now() - 86400000,
        listUnsubscribe: { http: "https://linkdin.com/settings", mailto: null },
        category: "social",
        labels: ["social"],
        isRead: true,
        size: 512,
        metadata: {},
        headers: {},
    },
    {
        id: "4",
        provider: "imap",
        providerId: "demo-4",
        sender: "junk@spam.com",
        senderName: "Spam Lord",
        senderDomain: "spam.com",
        subject: "You won a lottery!",
        preview: "Click here to claim your prize of $1,000,000...",
        receivedAt: new Date().toISOString(),
        timestamp: Date.now(),
        listUnsubscribe: { http: null, mailto: null },
        category: "promo",
        labels: ["spam"],
        isRead: false,
        size: 512,
        metadata: {},
        headers: {},
    },
    {
        id: "5",
        provider: "imap",
        providerId: "demo-5",
        sender: "junk@spam.com",
        senderName: "Spam Lord",
        senderDomain: "spam.com",
        subject: "Claim your prize now!",
        preview: "Final notice for your prize...",
        receivedAt: new Date().toISOString(),
        timestamp: Date.now(),
        listUnsubscribe: { http: null, mailto: null },
        category: "promo",
        labels: ["spam"],
        isRead: false,
        size: 512,
        metadata: {},
        headers: {},
    },
    {
        id: "6",
        provider: "imap",
        providerId: "demo-6",
        sender: "junk@spam.com",
        senderName: "Spam Lord",
        senderDomain: "spam.com",
        subject: "Last chance!",
        preview: "Your prize is waiting...",
        receivedAt: new Date().toISOString(),
        timestamp: Date.now(),
        listUnsubscribe: { http: null, mailto: null },
        category: "promo",
        labels: ["spam"],
        isRead: false,
        size: 512,
        metadata: {},
        headers: {},
    },
    {
        id: "7",
        provider: "imap",
        providerId: "demo-7",
        sender: "junk@spam.com",
        senderName: "Spam Lord",
        senderDomain: "spam.com",
        subject: "Urgent: Claim prize!",
        preview: "Immediate action required...",
        receivedAt: new Date().toISOString(),
        timestamp: Date.now(),
        listUnsubscribe: { http: null, mailto: null },
        category: "promo",
        labels: ["spam"],
        isRead: false,
        size: 512,
        metadata: {},
        headers: {},
    },
    {
        id: "8",
        provider: "imap",
        providerId: "demo-8",
        sender: "junk@spam.com",
        senderName: "Spam Lord",
        senderDomain: "spam.com",
        subject: "Prize waiting for you!",
        preview: "Don't ignore this...",
        receivedAt: new Date().toISOString(),
        timestamp: Date.now(),
        listUnsubscribe: { http: null, mailto: null },
        category: "promo",
        labels: ["spam"],
        isRead: false,
        size: 512,
        metadata: {},
        headers: {},
    },
];

import { NuclearDashboard } from "@/components/Dashboard/NuclearDashboard";
import { useSwipeBuffer } from "@/hooks/useSwipeBuffer";
import { MockEmailProvider } from "@/lib/providers/MockEmailProvider";
import { ParticleEngine } from "@/components/Effects/ParticleEngine";

export default function SwipePage() {
    const [mockStartIndex, setMockStartIndex] = useState(DEMO_EMAILS.length);

    const {
        activeWindow,
        fullQueue,
        consume,
        consumeBatch,
        nukeDomain,
        undo,
        reset,
        remainingCount,
        isFetching
    } = useSwipeBuffer(
        DEMO_EMAILS,
        async () => {
            const nextBatch = await MockEmailProvider.fetchBatch(mockStartIndex, 50);
            setMockStartIndex(prev => prev + 50);
            return nextBatch;
        }
    );

    const [score, setScore] = useState(0);
    // ... rest of state
    const [level, setLevel] = useState(1);
    const [xp, setXp] = useState(0);
    const [streak, setStreak] = useState(0);
    const [mode, setMode] = useState<"zen" | "rage">("zen");
    const [intensity, setIntensity] = useState(0);
    const [comboCount, setComboCount] = useState(0);
    const [lastSwipeTime, setLastSwipeTime] = useState(0);
    const [showUndo, setShowUndo] = useState(false);
    const [undoItem, setUndoItem] = useState<{ id: string; action: SwipeAction; description: string; undoToken: string; timestamp: number } | null>(null);
    const [isBossFight, setIsBossFight] = useState(false);
    const [isVictory, setIsVictory] = useState(false);
    const [showDashboard, setShowDashboard] = useState(false);
    const [particles, setParticles] = useState<{ x: number; y: number; color: string } | null>(null);

    // Sync mode and intensity based on swipe speed
    useEffect(() => {
        if (comboCount > 5) {
            setMode("rage");
            setIntensity(Math.min(1, (comboCount - 5) / 10));
        } else {
            setMode("zen");
            setIntensity(0);
        }
    }, [comboCount]);

    const handleSwipe = useCallback((email: NormalizedEmail, action: SwipeAction) => {
        // Update state
        const description = action === "delete" ? "Deleted email" :
            action === "unsubscribe" ? "Unsubscribed" :
                action === "block" ? "Blocked sender" : "Kept email";

        setUndoItem({
            id: email.id,
            action,
            description,
            undoToken: email.id,
            timestamp: Date.now()
        });
        setShowUndo(true);
        consume(email.id);

        // Trigger Particles
        const colors = {
            delete: "#ef4444",
            unsubscribe: "#3b82f6",
            block: "#f97316",
            keep: "#10b981",
            nuke: "#ef4444"
        };
        setParticles({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            color: colors[action as keyof typeof colors] || "#10b981"
        });

        // Handle game logic
        const now = Date.now();
        const timeDiff = now - lastSwipeTime;

        if (timeDiff < 2000) {
            setComboCount((c) => c + 1);
            setStreak((s) => s + 1);
        } else {
            setComboCount(1);
            setStreak(1);
        }
        setLastSwipeTime(now);

        // Points and XP
        const basePoints = 10;
        const comboBonus = comboCount * 2;
        setScore((s) => s + basePoints + comboBonus);
        setXp((x) => {
            const nextXp = x + 15;
            if (nextXp >= 100) {
                setLevel((l) => l + 1);
                return 0;
            }
            return nextXp;
        });

        // Check for boss fight
        if (remainingCount === 2 && !isBossFight) {
            setIsBossFight(true);
        }
    }, [remainingCount, comboCount, lastSwipeTime, isBossFight, consume]);

    const handleUndo = useCallback(() => {
        if (undoItem) {
            const originalEmail = DEMO_EMAILS.find(e => e.id === undoItem.id);
            if (originalEmail) {
                undo(originalEmail);
            }
            setShowUndo(false);
            setUndoItem(null);
            setComboCount(0);
        }
    }, [undoItem]);

    const handleLongPress = useCallback((email: NormalizedEmail) => {
        // Logic for domain nuke
        console.log("Nuking domain:", email.senderDomain);
    }, []);

    const handleStackEmpty = useCallback(() => {
        setIsVictory(true);
    }, []);

    return (
        <div className="min-h-screen bg-[#09090b] text-[#fafafa] relative overflow-hidden font-body">
            {/* Premium Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-0 right-0 w-[50%] h-[50%] rounded-full blur-[120px] transition-colors duration-1000 ${mode === 'rage' ? 'bg-red-500/10' : 'bg-emerald-500/10'}`} />
            </div>

            <Particles quantity={40} className="pointer-events-none opacity-20" color={mode === 'rage' ? "#ef4444" : "#10b981"} />
            <Meteors number={mode === 'rage' ? 20 : 5} className="pointer-events-none" />

            {/* Game Stats Dashboard - below the fixed global navbar but above overlays */}
            <header className="relative z-40 pt-20 pb-4 px-4 bg-black/60 backdrop-blur-md">
                <div className="max-w-4xl mx-auto flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        {isFetching && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-lg animate-pulse">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[10px] uppercase font-black text-emerald-500 tracking-widest">Indexing...</span>
                            </div>
                        )}
                        <div className="hidden md:flex items-center gap-4 text-zinc-400 text-sm font-medium">
                            <span>{remainingCount} emails left</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowDashboard(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            <span className="hidden sm:inline">Open Lobby</span>
                        </button>
                        <Link
                            href="/automation"
                            className="p-2.5 rounded-full glass border-zinc-800 hover:border-emerald-500/50 transition-all group"
                        >
                            <Settings className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400" />
                        </Link>
                    </div>
                </div>

                {/* Status Dashboard */}
                <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: "Level", val: level, icon: Crown, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                        { label: "XP", val: xp + "%", icon: Zap, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                        { label: "Streak", val: streak, icon: Flame, color: mode === 'rage' ? "text-red-400" : "text-emerald-400", bg: mode === 'rage' ? "bg-red-500/10" : "bg-emerald-500/10" },
                        { label: "Score", val: score, icon: Target, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    ].map((stat, i) => (
                        <div key={i} className="glass border-zinc-900 rounded-2xl p-3 flex flex-col justify-between group hover:border-emerald-500/20 transition-all text-left">
                            <div className="flex items-center gap-2 mb-1 text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                                <stat.icon className={`w-3 h-3 ${stat.color}`} />
                                {stat.label}
                            </div>
                            <p className="text-xl font-heading font-black">{stat.val}</p>
                            <div className="w-full h-1 bg-zinc-900 rounded-full mt-2 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: typeof stat.val === 'string' && stat.val.includes('%') ? stat.val : '100%' }}
                                    className={`h-full ${mode === 'rage' && stat.label === 'Streak' ? 'bg-red-500' : 'bg-emerald-500'}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </header>


            {/* Main Game Area */}
            <main className="relative z-10 flex-1 px-4 py-12 max-w-4xl mx-auto min-h-[60vh] flex flex-col justify-center">
                <div className="relative">
                    {/* Card Stack */}
                    {!isVictory && (
                        <div className="max-w-md mx-auto relative h-[450px]">
                            <CardStack
                                items={activeWindow}
                                onSwipe={handleSwipe}
                                onLongPress={handleLongPress}
                            />
                        </div>
                    )}

                    {/* Swipe Hints */}
                    {!isBossFight && !isVictory && (
                        <div className="max-w-sm mx-auto mt-12 grid grid-cols-4 gap-4">
                            {[
                                { dir: "←", icon: Trash2, action: "Delete", color: "text-red-400" },
                                { dir: "→", icon: MailX, action: "Unsub", color: "text-blue-400" },
                                { dir: "↑", icon: Ban, action: "Block", color: "text-orange-400" },
                                { dir: "↓", icon: Check, action: "Keep", color: "text-emerald-400" },
                            ].map((hint, i) => (
                                <div key={i} className="flex flex-col items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity">
                                    <div className="w-10 h-10 rounded-xl glass border-zinc-800 flex items-center justify-center mb-1">
                                        <hint.icon className={`w-5 h-5 ${hint.color}`} />
                                    </div>
                                    <span className="text-[10px] uppercase font-bold tracking-tighter text-zinc-500">{hint.action}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Level Up Progress Indicator */}
                <div className="max-w-md mx-auto mt-12 w-full text-center">
                    <div className="flex justify-between items-center mb-2 px-1 text-xs font-bold uppercase tracking-widest text-zinc-500">
                        <span>Progress to Lvl {level + 1}</span>
                        <span>{xp}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-emerald-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${xp}%` }}
                            transition={{ type: "spring", stiffness: 100 }}
                        />
                    </div>
                </div>
            </main>

            {/* Overlays & Modals */}
            <AnimatePresence>
                {showUndo && (
                    <UndoSnackbar
                        undoAction={undoItem}
                        onUndo={(token) => {
                            const originalEmail = DEMO_EMAILS.find(e => e.id === token);
                            if (originalEmail) {
                                undo(originalEmail);
                            }
                            setShowUndo(false);
                            setUndoItem(null);
                        }}
                        onDismiss={() => {
                            setShowUndo(false);
                            setUndoItem(null);
                        }}
                    />
                )}
            </AnimatePresence>

            <BossFight
                senderName={activeWindow[0]?.email.senderName || "Boss"}
                domain={activeWindow[0]?.email.senderDomain || "spam.com"}
                emailCount={activeWindow[0]?.groupCount || 10}
                onComplete={() => setIsBossFight(false)}
                onSkip={() => setIsBossFight(false)}
            />

            {isVictory && (
                <VictoryScreen
                    stats={{
                        emailsCleared: DEMO_EMAILS.length - remainingCount,
                        timeSavedMinutes: (DEMO_EMAILS.length - remainingCount) * 0.5,
                        topSendersRemoved: ["Daily Tech News", "Mega Promo"],
                        streakCount: streak,
                        inboxHealthScore: 95,
                        xpEarned: xp,
                    }}
                    onClose={() => {
                        setIsVictory(false);
                        setIsBossFight(false);
                        reset(DEMO_EMAILS);
                        setScore(0);
                        setStreak(0);
                        setComboCount(0);
                    }}
                    onSetupAutomation={() => {
                        window.location.href = "/automation";
                    }}
                />
            )}


            <AnimatePresence>
                {showDashboard && (
                    <NuclearDashboard
                        emails={fullQueue}
                        onDeleteBatch={(ids) => {
                            consumeBatch(ids);
                            setScore(s => s + ids.length * 5);
                        }}
                        onNukeDomain={(domain) => {
                            nukeDomain(domain);
                            setScore(s => s + 100);
                            setParticles({
                                x: window.innerWidth / 2,
                                y: window.innerHeight / 2,
                                color: "#ef4444"
                            });
                        }}
                        onClose={() => setShowDashboard(false)}
                    />
                )}
            </AnimatePresence>

            {particles && (
                <ParticleEngine
                    origin={{ x: particles.x, y: particles.y }}
                    color={particles.color}
                    onComplete={() => setParticles(null)}
                />
            )}
        </div>
    );
}
