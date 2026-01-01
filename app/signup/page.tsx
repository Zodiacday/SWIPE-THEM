/**
 * Signup Page - Obsidian Mint Edition
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Zap } from "lucide-react";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement actual registration
        console.log("Signup attempt:", { name, email, password });
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex items-center justify-center p-4 pt-20">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute bottom-1/4 right-1/4 w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-widest mb-6">
                        <Zap className="w-3 h-3" />
                        Join the Cleanup
                    </div>
                    <h1 className="text-4xl font-heading font-black mb-3">Create Account</h1>
                    <p className="text-zinc-500">Start your inbox zero journey today</p>
                </div>

                {/* Signup Form */}
                <div className="glass border-zinc-800 p-8 rounded-[2rem]">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-emerald-500/50 rounded-xl py-3.5 pl-12 pr-4 text-sm outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-emerald-500/50 rounded-xl py-3.5 pl-12 pr-4 text-sm outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create a strong password"
                                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-emerald-500/50 rounded-xl py-3.5 pl-12 pr-4 text-sm outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                        >
                            Create Account
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#09090b] px-3 text-zinc-600 font-bold tracking-widest">Or sign up with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-800 hover:bg-zinc-900 transition-all">
                            <span className="text-lg font-bold text-blue-500">G</span>
                            <span className="text-sm font-medium text-zinc-400">Google</span>
                        </button>
                        <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-800 hover:bg-zinc-900 transition-all">
                            <span className="text-lg font-bold text-sky-500">O</span>
                            <span className="text-sm font-medium text-zinc-400">Outlook</span>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center mt-8 text-sm text-zinc-500">
                    Already have an account?{" "}
                    <Link href="/login" className="text-emerald-500 font-bold hover:underline">
                        Login
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
