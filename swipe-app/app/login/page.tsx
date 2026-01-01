/**
 * Login Page - Real OAuth Integration
 */

"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Sparkles, Shield } from "lucide-react";

export default function LoginPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Redirect if already logged in
    useEffect(() => {
        if (session) {
            router.push("/swipe");
        }
    }, [session, router]);

    const handleGoogleLogin = () => {
        signIn("google", { callbackUrl: "/swipe" });
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
                <div className="animate-pulse text-emerald-500 text-lg font-bold">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex items-center justify-center p-4 pt-20">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-widest mb-6">
                        <Sparkles className="w-3 h-3" />
                        One Click Login
                    </div>
                    <h1 className="text-4xl font-heading font-black mb-3">Clean Your Inbox</h1>
                    <p className="text-zinc-500">Connect your email and start swiping in seconds</p>
                </div>

                {/* Login Card */}
                <div className="glass border-zinc-800 p-8 rounded-[2rem]">
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3 mb-4"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                        <Shield className="w-5 h-5 text-emerald-500 shrink-0" />
                        <p className="text-xs text-zinc-400">
                            We only read and delete emails you explicitly swipe. Your data stays on Google's servers.
                        </p>
                    </div>
                </div>

                {/* Features */}
                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                    {[
                        { label: "Swipe Left", desc: "Delete" },
                        { label: "Swipe Right", desc: "Unsubscribe" },
                        { label: "Swipe Down", desc: "Keep" },
                    ].map((item, i) => (
                        <div key={i} className="text-zinc-500">
                            <div className="text-xs font-bold uppercase tracking-wider text-emerald-500">{item.label}</div>
                            <div className="text-[10px]">{item.desc}</div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
