/**
 * Automation Settings - Obsidian Mint Edition
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Settings,
    Shield,
    Trash2,
    MailX,
    Ban,
    ChevronRight,
    Search,
    Plus,
    Check,
    Bell,
    Lock,
    Zap,
} from "lucide-react";
import Link from "next/link";

interface AutomationRule {
    id: string;
    sender: string;
    domain: string;
    action: "delete" | "unsubscribe" | "block";
    lastMatch?: string;
    matches: number;
    enabled: boolean;
}

const INITIAL_RULES: AutomationRule[] = [
    {
        id: "1",
        sender: "Newsletter Express",
        domain: "news-express.co",
        action: "unsubscribe",
        lastMatch: "10 mins ago",
        matches: 45,
        enabled: true,
    },
    {
        id: "2",
        sender: "Promo Store",
        domain: "promostore.net",
        action: "delete",
        lastMatch: "2 hours ago",
        matches: 128,
        enabled: true,
    },
    {
        id: "3",
        sender: "Social Spam",
        domain: "social-notifs.com",
        action: "block",
        lastMatch: "Yesterday",
        matches: 12,
        enabled: false,
    },
];

export default function AutomationPage() {
    const [rules, setRules] = useState<AutomationRule[]>(INITIAL_RULES);
    const [isAutomationEnabled, setIsAutomationEnabled] = useState(true);

    const toggleRule = (id: string) => {
        setRules((prev) =>
            prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
        );
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-body">
            <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-24">
                {/* Dashboard Header */}
                <div className="grid md:grid-cols-2 gap-12 mb-16 items-center">
                    <div>
                        <h2 className="text-5xl font-heading font-black mb-6 tracking-tighter">
                            Inbox <span className="text-emerald-500">Autopilot.</span>
                        </h2>
                        <p className="text-zinc-500 text-lg leading-relaxed mb-8">
                            Configure rules to automatically handle recurring spam patterns.
                            Your decisions are synced across all your devices.
                        </p>
                        <div className="flex items-center gap-4">
                            <button className="px-6 py-3 bg-emerald-500 text-black font-bold rounded-full hover:bg-emerald-400 transition-all flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                New Sentinel Rule
                            </button>
                            <div className="flex items-center gap-2 px-4 py-3 bg-zinc-950/50 border border-zinc-900 rounded-full">
                                <div className={`w-3 h-3 rounded-full ${isAutomationEnabled ? 'bg-emerald-500 glow-emerald' : 'bg-zinc-700'}`} />
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest leading-none">
                                    {isAutomationEnabled ? 'Active' : 'Paused'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="glass border-zinc-800 p-8 rounded-[2rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-zinc-900 rounded-2xl border border-zinc-800">
                                    <Shield className="w-6 h-6 text-emerald-500" />
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Protection Level</p>
                                    <p className="text-2xl font-heading font-black text-emerald-500">High-Risk</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-zinc-500">Threats Prevented</span>
                                    <span className="text-white font-bold tracking-widest">1,248</span>
                                </div>
                                <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                    <div className="w-[85%] h-full bg-emerald-500" />
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-zinc-500">Time Saved</span>
                                    <span className="text-white font-bold tracking-widest">14.2 Hours</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rules Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Active Sentinel Rules</h3>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950 border border-zinc-900 rounded-lg">
                            <Search className="w-3.5 h-3.5 text-zinc-600" />
                            <input
                                type="text"
                                placeholder="Filter rules..."
                                className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest placeholder:text-zinc-700 focus:ring-0 w-32"
                            />
                        </div>
                    </div>

                    <div className="grid gap-3">
                        {rules.map((rule) => (
                            <div
                                key={rule.id}
                                className={`group p-6 glass border-zinc-900 rounded-3xl flex items-center gap-6 transition-all hover:border-zinc-700 ${!rule.enabled ? 'opacity-50' : ''}`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border border-zinc-800 ${rule.action === 'delete' ? 'bg-red-500/5' :
                                    rule.action === 'unsubscribe' ? 'bg-blue-500/5' : 'bg-orange-500/5'
                                    }`}>
                                    {rule.action === 'delete' && <Trash2 className="w-6 h-6 text-red-500" />}
                                    {rule.action === 'unsubscribe' && <MailX className="w-6 h-6 text-blue-500" />}
                                    {rule.action === 'block' && <Ban className="w-6 h-6 text-orange-500" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-heading font-bold text-lg text-white truncate">{rule.sender}</h4>
                                        <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-500">@{rule.domain}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                                        <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" /> {rule.matches} matches</span>
                                        <span className="flex items-center gap-1.5"><Bell className="w-3 h-3 text-zinc-500" /> {rule.lastMatch}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => toggleRule(rule.id)}
                                        className={`w-12 h-6 rounded-full relative transition-colors ${rule.enabled ? 'bg-emerald-500' : 'bg-zinc-800'}`}
                                    >
                                        <motion.div
                                            className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                                            animate={{ x: rule.enabled ? 24 : 0 }}
                                        />
                                    </button>
                                    <ChevronRight className="w-5 h-5 text-zinc-800 group-hover:text-zinc-600 transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Safety Notice */}
                <div className="mt-16 p-8 rounded-[2rem] bg-zinc-950/30 border border-zinc-900 border-dashed text-center">
                    <p className="text-xs uppercase font-bold tracking-widest text-zinc-600 max-w-lg mx-auto leading-relaxed">
                        Sentinels operate on shared heuristics and individual confirmation. Decisive actions are non-reversible after 30 seconds.
                    </p>
                </div>
            </main>
        </div>
    );
}
