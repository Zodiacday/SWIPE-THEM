/**
 * Particle Engine - Obsidian Mint Edition
 * Creates "Digital Dust" feedback for swipe actions.
 */

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
}

interface ParticleEngineProps {
    origin: { x: number; y: number };
    color: string;
    count?: number;
    onComplete: () => void;
}

export function ParticleEngine({
    origin,
    color,
    count = 20,
    onComplete
}: ParticleEngineProps) {
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        const newParticles = Array.from({ length: count }).map((_, i) => ({
            id: Math.random().toString(),
            x: origin.x,
            y: origin.y,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15,
            color,
            size: Math.random() * 4 + 2
        }));

        setParticles(newParticles);

        const timer = setTimeout(onComplete, 1000);
        return () => clearTimeout(timer);
    }, [origin, color, count, onComplete]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[100]">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    initial={{ x: p.x, y: p.y, opacity: 1, scale: 1 }}
                    animate={{
                        x: p.x + p.vx * 20,
                        y: p.y + p.vy * 20,
                        opacity: 0,
                        scale: 0
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{
                        position: "absolute",
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        borderRadius: "50%",
                        boxShadow: `0 0 10px ${p.color}`
                    }}
                />
            ))}
        </div>
    );
}
