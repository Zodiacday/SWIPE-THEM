"use client";

/**
 * Obsidian Mint Redesigned Landing Page
 * Focus: High-end, minimal, professional
 */

import { motion } from "framer-motion";
import Link from "next/link";
import {
    Shield,
    Zap,
    Sparkles,
    Flame,
    Crown,
    Target,
    ArrowRight,
    Mail,
    Trash2,
    MailX,
    Ban,
    Check,
} from "lucide-react";
import { Particles, Meteors } from "@/components/ui";
import { HeroDemo } from "@/components/HeroDemo/HeroDemo";

export default function Home() {
    return (
        <div className="min-h-screen bg-[#09090b] text-[#fafafa] overflow-hidden relative font-body">
            {/* Ambient background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
            </div>

            <Particles quantity={40} className="pointer-events-none opacity-30" color="#10b981" />
            <Meteors number={10} className="pointer-events-none opacity-20" />

            {/* Hero Section - padding-top accounts for fixed navbar */}
            <section className="relative pt-24 pb-12 lg:pt-32 lg:pb-24 px-4 sm:px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-20">
                    {/* Left Content */}
                    <div className="flex-1 text-center lg:text-left z-10 w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-6"
                        >
                            <Sparkles className="w-3 h-3" />
                            The New Era of Email Control
                        </motion.div>

                        <motion.h1
                            className="text-5xl sm:text-6xl lg:text-8xl font-heading font-black mb-6 tracking-tight leading-[0.9] italic"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            INBOX.<br />
                            <span className="text-emerald-500 not-italic">REMASTERED.</span>
                        </motion.h1>

                        <motion.p
                            className="text-base sm:text-lg lg:text-xl text-zinc-400 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            Clean your inbox with satisfying gestures. No complex AI, no magic—just pure, high-performance email management.
                        </motion.p>

                        <motion.div
                            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Link
                                href="/onboarding"
                                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 text-black font-black rounded-full hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.3)] group"
                            >
                                Start Experience
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="#demo"
                                className="w-full sm:w-auto px-8 py-4 border border-zinc-800 text-white font-bold rounded-full hover:bg-zinc-900 transition-all flex items-center justify-center"
                            >
                                Watch Demo
                            </Link>
                        </motion.div>
                    </div>

                    {/* Right Demo Content */}
                    <div id="demo" className="flex-1 relative z-10 w-full mt-8 lg:mt-0 flex justify-center lg:justify-end">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[450px]"
                        >
                            <HeroDemo />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 px-6 border-t border-zinc-900 bg-zinc-950/30">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Shield,
                                title: "Privacy First",
                                desc: "We never read your email content. Metadata stays on your device.",
                            },
                            {
                                icon: Zap,
                                title: "Effortless Flow",
                                desc: "Clean thousands of emails in minutes, not hours.",
                            },
                            {
                                icon: Target,
                                title: "Smart Detection",
                                desc: "Automatically identifies newsletters, social updates, and promo spam.",
                            },
                        ].map((f, i) => (
                            <div key={i} className="p-8 rounded-3xl glass border-zinc-800 hover:border-emerald-500/20 transition-all group">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center mb-6 group-hover:bg-emerald-500/10 transition-colors">
                                    <f.icon className="w-6 h-6 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                                </div>
                                <h3 className="text-xl font-heading font-bold mb-3">{f.title}</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 px-6 relative">
                <div className="max-w-3xl mx-auto text-center glass p-12 md:p-20 rounded-[3rem] border-zinc-800">
                    <h2 className="text-4xl md:text-5xl font-heading font-black mb-6">Ready to reclaim your time?</h2>
                    <p className="text-zinc-400 mb-10 text-lg">Join thousands of users who have mastered their inbox.</p>
                    <Link
                        href="/swipe"
                        className="inline-flex items-center gap-2 px-10 py-5 bg-white text-black text-xl rounded-full font-bold hover:bg-zinc-200 transition-all"
                    >
                        Try the Demo
                        <ArrowRight className="w-6 h-6" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-zinc-900 text-center">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <img src="/logo.png" alt="Swipe Logo" className="w-8 h-8 object-contain" />
                    <span className="font-heading font-bold">Swipe</span>
                </div>
                <p className="text-zinc-500 text-sm">© 2026 Swipe Inc. All rights reserved.</p>
            </footer>
        </div>
    );
}
