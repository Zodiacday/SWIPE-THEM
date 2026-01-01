/**
 * Onboarding Flow - Obsidian Mint Edition
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail,
    Inbox,
    Zap,
    Shield,
    Check,
    Trash2,
    MailX,
    Ban,
    ArrowRight,
    Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PermissionGuard, PermissionStatus } from "@/lib/security/PermissionGuard";

type OnboardingStage =
    | "welcome"
    | "problem"
    | "promise"
    | "safety"
    | "connect"
    | "tutorial"
    | "first_cleanup";

export default function OnboardingPage() {
    const [stage, setStage] = useState<OnboardingStage>("welcome");
    const [tutorialStep, setTutorialStep] = useState(0);
    const router = useRouter();

    const nextStage = () => {
        const stages: OnboardingStage[] = [
            "welcome",
            "problem",
            "promise",
            "safety",
            "connect",
            "tutorial",
            "first_cleanup",
        ];
        const currentIndex = stages.indexOf(stage);
        if (currentIndex < stages.length - 1) {
            setStage(stages[currentIndex + 1]);
        } else {
            router.push("/swipe");
        }
    };

    const skipToSwipe = () => {
        router.push("/swipe");
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-[#fafafa] overflow-hidden font-body">
            {/* Skip button */}
            <button
                onClick={skipToSwipe}
                className="fixed top-6 right-6 z-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-emerald-400 transition-colors"
            >
                Skip Onboarding
            </button>

            <AnimatePresence mode="wait">
                {stage === "welcome" && (
                    <WelcomeStage key="welcome" onNext={nextStage} />
                )}
                {stage === "problem" && (
                    <ProblemStage key="problem" onNext={nextStage} />
                )}
                {stage === "promise" && (
                    <PromiseStage key="promise" onNext={nextStage} />
                )}
                {stage === "safety" && <SafetyStage key="safety" onNext={nextStage} />}
                {stage === "connect" && (
                    <ConnectStage key="connect" onNext={nextStage} />
                )}
                {stage === "tutorial" && (
                    <TutorialStage
                        key="tutorial"
                        step={tutorialStep}
                        onStepComplete={() => setTutorialStep((s) => s + 1)}
                        onNext={nextStage}
                    />
                )}
                {stage === "first_cleanup" && (
                    <FirstCleanupStage key="first_cleanup" onNext={nextStage} />
                )}
            </AnimatePresence>

            {/* Progress indicator */}
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4">
                {["welcome", "problem", "promise", "safety", "connect", "tutorial", "first_cleanup"].map(
                    (s, i) => (
                        <div
                            key={s}
                            className={`h-1 rounded-full transition-all duration-500 ${s === stage
                                ? "w-8 bg-emerald-500"
                                : "w-2 bg-zinc-800"
                                }`}
                        />
                    )
                )}
            </div>
        </div>
    );
}

// Stage 1: Welcome
function WelcomeStage({ onNext }: { onNext: () => void }) {
    return (
        <motion.div
            className="min-h-screen flex items-center justify-center p-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="max-w-2xl">
                <motion.div
                    className="mb-10 inline-block"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                >
                    <div className="w-24 h-24 flex items-center justify-center">
                        <img src="/logo.png" alt="Swipe Logo" className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                    </div>
                </motion.div>

                <h1 className="text-6xl md:text-7xl font-heading font-black mb-6 tracking-tighter italic">
                    SWIPE.<br />
                    <span className="text-emerald-500 not-italic">THEN ZERO.</span>
                </h1>

                <p className="text-xl text-zinc-500 mb-12 max-w-lg mx-auto leading-relaxed">
                    Cleaning your inbox doesn&apos;t have to be a chore.
                    Experience the satisfying mechanics of a clean inbox.
                </p>

                <button
                    onClick={onNext}
                    className="px-10 py-5 bg-white text-black text-xl font-bold rounded-full hover:bg-zinc-200 transition-all flex items-center gap-3 mx-auto shadow-2xl"
                >
                    Start Experience
                    <ArrowRight className="w-6 h-6" />
                </button>
            </div>
        </motion.div>
    );
}

// Stage 2: The Problem
function ProblemStage({ onNext }: { onNext: () => void }) {
    return (
        <motion.div
            className="min-h-screen flex items-center justify-center p-6 text-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
        >
            <div className="max-w-2xl">
                <div className="relative w-40 h-40 mx-auto mb-10">
                    <Inbox className="w-40 h-40 text-zinc-800" />
                    <motion.div
                        className="absolute top-0 right-0 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-black text-xs"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        99+
                    </motion.div>
                </div>

                <h2 className="text-5xl font-heading font-black mb-6 tracking-tight">
                    Inbox <span className="text-red-500">Chaos.</span>
                </h2>

                <p className="text-xl text-zinc-500 mb-12 leading-relaxed">
                    The average user wastes <span className="text-white font-bold">15 hours a month</span> deleting spam.
                    Newsletters, promos, and dark patterns are cluttering your focus.
                </p>

                <button
                    onClick={onNext}
                    className="px-10 py-5 border border-zinc-800 text-white text-lg font-bold rounded-full hover:bg-zinc-900 transition-all uppercase tracking-widest text-xs"
                >
                    Proceed to Solution
                </button>
            </div>
        </motion.div>
    );
}

// Stage 3: The Promise
function PromiseStage({ onNext }: { onNext: () => void }) {
    return (
        <motion.div
            className="min-h-screen flex items-center justify-center p-6 text-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
        >
            <div className="max-w-4xl">
                <div className="w-20 h-20 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-10 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <Zap className="w-10 h-10 text-black fill-current" />
                </div>

                <h2 className="text-5xl font-heading font-black mb-12 tracking-tight">
                    Clean with <span className="text-emerald-500">Gestures.</span>
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {[
                        { icon: Trash2, text: "Delete", color: "text-red-500", bg: "bg-red-500/5" },
                        { icon: MailX, text: "Unsub", color: "text-blue-500", bg: "bg-blue-500/5" },
                        { icon: Ban, text: "Block", color: "text-orange-500", bg: "bg-orange-500/5" },
                        { icon: Check, text: "Keep", color: "text-emerald-500", bg: "bg-emerald-500/5" },
                    ].map((action, i) => (
                        <div key={i} className={`p-6 rounded-3xl border border-zinc-900 ${action.bg}`}>
                            <action.icon className={`w-8 h-8 ${action.color} mx-auto mb-3`} />
                            <p className="text-xs font-black uppercase tracking-widest text-zinc-400">{action.text}</p>
                        </div>
                    ))}
                </div>

                <button
                    onClick={onNext}
                    className="px-12 py-5 bg-emerald-500 text-black text-xl font-bold rounded-full hover:bg-emerald-400 transition-all"
                >
                    Experience The UI
                </button>
            </div>
        </motion.div>
    );
}

// Stage 4: Safety & Trust
function SafetyStage({ onNext }: { onNext: () => void }) {
    return (
        <motion.div
            className="min-h-screen flex items-center justify-center p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
        >
            <div className="max-w-3xl w-full">
                <div className="text-center mb-16">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h2 className="text-5xl font-heading font-black mb-4">Privacy by Design.</h2>
                    <p className="text-zinc-500 text-lg">We process metadata, never your secrets.</p>
                </div>

                <div className="space-y-4 mb-16">
                    {[
                        { title: "Zero-Read Policy", desc: "Swipe never interacts with the body of your emails. Only headers." },
                        { title: "End-to-End Control", desc: "Every action is stored locally and synced via secure OAuth tokens." },
                        { title: "Immediate Undo", desc: "Change your mind? Swipe back or click undo within 30 seconds." },
                    ].map((item, i) => (
                        <div key={i} className="p-6 rounded-2xl glass border-zinc-800 flex items-start gap-4">
                            <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <Check className="w-3 h-3 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-1">{item.title}</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={onNext}
                    className="w-full py-5 bg-white text-black text-xl font-bold rounded-full hover:bg-zinc-200 transition-all"
                >
                    I Authorize Access
                </button>
            </div>
        </motion.div>
    );
}

// Stage 5: Connect
function ConnectStage({ onNext }: { onNext: () => void }) {
    const [status, setStatus] = useState<PermissionStatus | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = async () => {
        setIsConnecting(true);
        // Simulate OAuth Popup and Scope selection
        setTimeout(async () => {
            const mockGranted = [
                "https://www.googleapis.com/auth/gmail.readonly",
                "https://www.googleapis.com/auth/gmail.modify",
                "https://www.googleapis.com/auth/gmail.labels"
            ];
            const result = await PermissionGuard.verifyPermissions(mockGranted);
            setStatus(result);
            setIsConnecting(false);
        }, 1500);
    };

    return (
        <motion.div
            className="min-height-screen flex items-center justify-center p-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="max-w-md w-full">
                <h2 className="text-4xl font-heading font-black mb-8">Establish Connection.</h2>

                <div className="glass border-zinc-800 p-8 rounded-3xl mb-8">
                    {!status ? (
                        <>
                            <div className="flex justify-center gap-6 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-pointer border border-blue-500/20 active:scale-95">
                                    <div className="text-2xl font-black text-blue-500">G</div>
                                </div>
                                <div className="w-14 h-14 rounded-2xl bg-sky-500/10 flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-pointer border border-sky-500/20 active:scale-95">
                                    <div className="text-2xl font-black text-sky-500">O</div>
                                </div>
                            </div>
                            <p className="text-zinc-500 text-sm mb-6">Connect your primary provider to begin indexing your inbox metadata.</p>
                            <button
                                onClick={handleConnect}
                                disabled={isConnecting}
                                className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50"
                            >
                                {isConnecting ? "Connecting..." : "OAuth Secure Login"}
                            </button>
                        </>
                    ) : (
                        <div className="text-left space-y-6">
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                                <Check className="w-5 h-5 text-emerald-500" />
                                <span className="text-sm font-bold text-emerald-500">Authentication Successful</span>
                            </div>

                            <div className="space-y-3">
                                <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Required Permissions</p>
                                {status.granted.map(scope => (
                                    <div key={scope} className="flex items-center gap-2 text-xs text-zinc-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        {scope.split('/').pop()}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={onNext}
                                className="w-full py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all"
                            >
                                Initialize Swipe Engine
                            </button>
                        </div>
                    )}
                </div>

                <p className="text-[10px] text-zinc-600 uppercase font-medium tracking-[0.2em]">
                    🔒 Your data never leaves your device.
                </p>
            </div>
        </motion.div>
    );
}

// Stage 6: Tutorial
function TutorialStage({
    step,
    onStepComplete,
    onNext,
}: {
    step: number;
    onStepComplete: () => void;
    onNext: () => void;
}) {
    const [isAdvancing, setIsAdvancing] = useState(false);

    useEffect(() => {
        if (step >= 2 && !isAdvancing) {
            setIsAdvancing(true);
            onNext();
        }
    }, [step, onNext, isAdvancing]);

    if (step >= 2) {
        return null;
    }

    return (
        <motion.div
            className="min-h-screen flex items-center justify-center p-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="max-w-lg">
                <div className="mb-10 text-xs font-black uppercase tracking-[0.3em] text-emerald-500">Tutorial {step + 1} / 2</div>
                <h2 className="text-5xl font-heading font-black mb-12 italic tracking-tighter">
                    {step === 0 ? "SWIPE RIGHT TO UNSUBSCRIBE" : "SWIPE LEFT TO DELETE"}
                </h2>

                <div className="relative h-64 border-2 border-dashed border-zinc-800 rounded-3xl mb-12 flex items-center justify-center">
                    <motion.div
                        className="w-32 h-48 glass rounded-2xl border-emerald-500"
                        animate={{
                            x: step === 0 ? [0, 100, 0] : [0, -100, 0],
                            rotate: step === 0 ? [0, 10, 0] : [0, -10, 0]
                        }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    />
                </div>

                <button
                    onClick={onStepComplete}
                    className="px-12 py-5 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-all uppercase tracking-widest text-sm"
                >
                    Mastered.
                </button>
            </div>
        </motion.div>
    );
}

// Stage 7: First Cleanup
function FirstCleanupStage({ onNext }: { onNext: () => void }) {
    const [scanProgress, setScanProgress] = useState(0);
    const [emailCount, setEmailCount] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setScanProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsComplete(true);
                    return 100;
                }
                const increment = Math.random() * 5;
                const next = prev + increment;
                setEmailCount(Math.floor(next * 24.51)); // Target ~2451
                return next;
            });
        }, 150);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            className="min-h-screen flex items-center justify-center p-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="max-w-2xl w-full">
                <AnimatePresence mode="wait">
                    {!isComplete ? (
                        <motion.div
                            key="scanning"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="space-y-12"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-full font-bold uppercase tracking-widest text-xs animate-pulse">
                                Indexing Inbox Metadata...
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-7xl font-heading font-black tracking-tighter tabular-nums text-white">
                                    {emailCount.toLocaleString()}
                                </h2>
                                <p className="text-zinc-500 font-medium uppercase tracking-[0.2em] text-xs">Emails Indexed</p>
                            </div>

                            <div className="max-w-md mx-auto h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                                <motion.div
                                    className="h-full bg-emerald-500 glow-emerald"
                                    animate={{ width: `${scanProgress}%` }}
                                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                                />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-12"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black rounded-full font-bold uppercase tracking-widest text-xs">
                                Initialization Complete
                            </div>
                            <h2 className="text-7xl font-heading font-black tracking-tighter text-white uppercase italic">
                                Targets <span className="text-emerald-500">Acquired.</span>
                            </h2>
                            <p className="text-xl text-zinc-500 max-w-lg mx-auto leading-relaxed">
                                We found <span className="text-white font-black">{emailCount.toLocaleString()}</span> items of baggage.
                                It&apos;s time to clear the slate.
                            </p>

                            <button
                                onClick={onNext}
                                className="group relative px-16 py-6 bg-emerald-500 text-black text-2xl font-black rounded-full hover:bg-emerald-400 transition-all shadow-[0_0_50px_rgba(16,185,129,0.3)]"
                            >
                                <span className="relative z-10">PURGE INBOX</span>
                                <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:animate-ping pointer-events-none" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
