/**
 * Global Navbar - Obsidian Mint Edition
 * Persistent navigation across all pages
 * Fully responsive for desktop and mobile
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogIn, Zap } from "lucide-react";

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/swipe", label: "Swipe" },
    { href: "/automation", label: "Automation" },
    { href: "/providers", label: "Accounts" },
];

export function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    // Don't show navbar on onboarding
    if (pathname === "/onboarding") return null;

    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-white/5 bg-black/60 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group shrink-0">
                    <img
                        src="/logo.png"
                        alt="Swipe Logo"
                        className="w-8 h-8 object-contain group-hover:scale-110 transition-transform"
                    />
                    <span className="text-lg font-heading font-bold text-white hidden sm:inline">Swipe</span>
                </Link>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-1">
                    {NAV_LINKS.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all ${pathname === link.href
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Auth Buttons - Desktop */}
                <div className="hidden md:flex items-center gap-2 lg:gap-3">
                    <Link
                        href="/login"
                        className="flex items-center gap-2 px-3 lg:px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                    >
                        <LogIn className="w-4 h-4" />
                        <span className="hidden lg:inline">Login</span>
                    </Link>
                    <Link
                        href="/signup"
                        className="flex items-center gap-2 px-4 lg:px-5 py-2 bg-emerald-500 text-black text-sm font-bold rounded-full hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    >
                        <Zap className="w-4 h-4" />
                        <span className="hidden sm:inline">Get Started</span>
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? (
                        <X className="w-6 h-6 text-white" />
                    ) : (
                        <Menu className="w-6 h-6 text-white" />
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-white/5 bg-black/95 backdrop-blur-xl"
                    >
                        <div className="px-4 py-4 space-y-2">
                            {NAV_LINKS.map(link => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${pathname === link.href
                                            ? 'bg-emerald-500/10 text-emerald-400'
                                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            <div className="h-[1px] bg-white/5 my-4" />

                            <Link
                                href="/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-4 py-3 rounded-xl text-base font-medium text-zinc-400 hover:text-white"
                            >
                                Login
                            </Link>
                            <Link
                                href="/signup"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-4 py-3 rounded-xl text-base font-bold bg-emerald-500 text-black text-center"
                            >
                                Get Started
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
