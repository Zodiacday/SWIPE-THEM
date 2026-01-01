/**
 * Nuclear Dashboard - Obsidian Mint Edition
 * High-density list view for "Burning the Past"
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Trash2,
    Ban,
    Search,
    Filter,
    CheckSquare,
    Square,
    Zap,
    Skull
} from "lucide-react";
import { NormalizedEmail } from "@/lib/types";

interface NuclearDashboardProps {
    emails: NormalizedEmail[];
    onDeleteBatch: (ids: string[]) => void;
    onNukeDomain: (domain: string) => void;
    onClose: () => void;
}

export function NuclearDashboard({
    emails,
    onDeleteBatch,
    onNukeDomain,
    onClose
}: NuclearDashboardProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");

    const filteredEmails = emails.filter(email =>
        email.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredEmails.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredEmails.map(e => e.id)));
        }
    };

    const handleBulkDelete = () => {
        onDeleteBatch(Array.from(selectedIds));
        setSelectedIds(new Set());
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl p-4 md:p-8"
        >
            <div className="w-full max-w-5xl h-full bg-[#09090b] border border-white/5 rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-heading font-black flex items-center gap-3">
                            <span className="text-emerald-500">Nuclear</span> Dashboard
                        </h2>
                        <p className="text-zinc-500 text-sm mt-1">Found {emails.length} potential threats in your past history.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleBulkDelete}
                            disabled={selectedIds.size === 0}
                            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all disabled:opacity-30 disabled:grayscale flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Nuke Selected ({selectedIds.size})
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                        >
                            Back to Arena
                        </button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="px-8 py-4 bg-white/2 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter by sender or subject..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-emerald-500/50 outline-none rounded-xl py-2.5 pl-10 pr-4 text-sm transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleSelectAll}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
                        >
                            {selectedIds.size === filteredEmails.length ? <CheckSquare className="w-4 h-4 text-emerald-500" /> : <Square className="w-4 h-4" />}
                            Select All
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8 custom-scrollbar">
                    <table className="w-full border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-left text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-600">
                                <th className="px-4 py-2 w-10">Select</th>
                                <th className="px-4 py-2">Sender</th>
                                <th className="px-4 py-2 hidden md:table-cell">Subject</th>
                                <th className="px-4 py-2 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmails.map((email) => (
                                <tr
                                    key={email.id}
                                    className={`group hover:bg-white/5 transition-colors rounded-xl ${selectedIds.has(email.id) ? 'bg-emerald-500/5' : ''}`}
                                >
                                    <td className="px-4 py-3 align-middle">
                                        <button onClick={() => toggleSelect(email.id)} className="text-zinc-600 hover:text-emerald-500">
                                            {selectedIds.has(email.id) ? <CheckSquare className="w-5 h-5 text-emerald-500" /> : <Square className="w-5 h-5" />}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 align-middle">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-[10px] text-zinc-500">
                                                {email.senderName?.[0] || email.sender[0].toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-sm text-zinc-200 truncate">{email.senderName || email.sender.split('@')[0]}</div>
                                                <div className="text-[10px] text-zinc-500 truncate">{email.sender}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 align-middle hidden md:table-cell">
                                        <div className="text-sm text-zinc-400 truncate max-w-md">{email.subject}</div>
                                    </td>
                                    <td className="px-4 py-3 align-middle text-right">
                                        <button
                                            onClick={() => onNukeDomain(email.senderDomain)}
                                            className="p-2 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white flex items-center gap-2 ml-auto text-[10px] font-bold uppercase"
                                        >
                                            <Skull className="w-3 h-3" />
                                            Nuke Domain
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredEmails.length === 0 && (
                        <div className="py-20 text-center">
                            <Zap className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                            <p className="text-zinc-500 font-medium">No threats found matching your search.</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
