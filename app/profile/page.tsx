/**
 * Profile Page - Obsidian Mint Edition
 */

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    User,
    Mail,
    Calendar,
    Settings,
    LogOut,
    Trophy,
    Trash2,
    Clock,
    ChevronRight,
    Shield
} from "lucide-react";

// Mock user data
const MOCK_USER = {
    name: "Demo User",
    email: "demo@swipe.app",
    joinedDate: "January 2026",
    avatar: null,
    stats: {
        emailsCleared: 2451,
        timeSaved: 14.2,
        streakDays: 7,
        level: 12
    }
};

export default function ProfilePage() {
    return (
        <div className="min-h-screen bg-[#09090b] text-[#fafafa] pt-20 pb-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass border-zinc-800 p-8 rounded-[2rem] mb-6"
                >
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <User className="w-10 h-10 text-emerald-500" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-heading font-black mb-1">{MOCK_USER.name}</h1>
                            <p className="text-zinc-500 text-sm flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {MOCK_USER.email}
                            </p>
                            <p className="text-zinc-600 text-xs mt-1 flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                Joined {MOCK_USER.joinedDate}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">Level</div>
                            <div className="text-3xl font-heading font-black text-emerald-500">{MOCK_USER.stats.level}</div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-3 gap-4 mb-6"
                >
                    {[
                        { icon: Trash2, label: "Emails Cleared", value: MOCK_USER.stats.emailsCleared.toLocaleString(), color: "text-red-400" },
                        { icon: Clock, label: "Hours Saved", value: MOCK_USER.stats.timeSaved.toString(), color: "text-blue-400" },
                        { icon: Trophy, label: "Day Streak", value: MOCK_USER.stats.streakDays.toString(), color: "text-emerald-400" },
                    ].map((stat, i) => (
                        <div key={i} className="glass border-zinc-800 p-5 rounded-2xl text-center">
                            <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
                            <div className="text-2xl font-heading font-black mb-1">{stat.value}</div>
                            <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Settings Links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass border-zinc-800 rounded-[2rem] overflow-hidden mb-6"
                >
                    {[
                        { icon: Mail, label: "Connected Accounts", href: "/providers", desc: "Manage your email providers" },
                        { icon: Settings, label: "Automation Rules", href: "/automation", desc: "Configure auto-cleanup" },
                        { icon: Shield, label: "Privacy Settings", href: "#", desc: "Control your data" },
                    ].map((item, i) => (
                        <Link
                            key={i}
                            href={item.href}
                            className="flex items-center gap-4 p-5 border-b border-zinc-900 last:border-0 hover:bg-white/2 transition-colors group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-emerald-500/30 transition-colors">
                                <item.icon className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-white">{item.label}</div>
                                <div className="text-xs text-zinc-500">{item.desc}</div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                        </Link>
                    ))}
                </motion.div>

                {/* Logout Button */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="w-full p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 font-bold flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </motion.button>
            </div>
        </div>
    );
}
