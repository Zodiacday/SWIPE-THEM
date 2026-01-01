/**
 * Premium Particle System
 * Inspired by Aceternity UI's background effects
 * Features: Floating particles with depth and glow
 */

"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
    color: string;
    blur: number;
}

interface ParticlesProps {
    quantity?: number;
    staticity?: number;
    ease?: number;
    refresh?: boolean;
    color?: string;
    varyColor?: number;
    className?: string;
}

export function Particles({
    quantity = 50,
    staticity = 50,
    ease = 50,
    refresh = false,
    color = "#a855f7",
    varyColor = 20,
    className = "",
}: ParticlesProps) {
    const particles = useMemo(() => {
        const particleArray: Particle[] = [];

        for (let i = 0; i < quantity; i++) {
            particleArray.push({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 3 + 1,
                duration: Math.random() * 20 + 10,
                delay: Math.random() * 5,
                color: varyColor > 0
                    ? `hsl(${270 + (Math.random() - 0.5) * varyColor}, 70%, ${50 + (Math.random() - 0.5) * 20}%)`
                    : color,
                blur: Math.random() * 2,
            });
        }

        return particleArray;
    }, [quantity, color, varyColor, refresh]);

    return (
        <div className={`absolute inset-0 overflow-hidden ${className}`}>
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: particle.size,
                        height: particle.size,
                        backgroundColor: particle.color,
                        filter: `blur(${particle.blur}px)`,
                        boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                    }}
                    animate={{
                        x: [
                            0,
                            (Math.random() - 0.5) * staticity,
                            (Math.random() - 0.5) * staticity,
                            0,
                        ],
                        y: [
                            0,
                            (Math.random() - 0.5) * staticity,
                            (Math.random() - 0.5) * staticity,
                            0,
                        ],
                        opacity: [0.2, 0.8, 0.8, 0.2],
                    }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        delay: particle.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}

/**
 * Meteor Effect Component
 * Inspired by Aceternity UI's Meteors
 * Features: Shooting star effect across the screen
 */

interface MeteorsProps {
    number?: number;
    className?: string;
}

export function Meteors({ number = 20, className = "" }: MeteorsProps) {
    const meteors = useMemo(() => {
        return Array.from({ length: number }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${Math.random() * 2 + 2}s`,
        }));
    }, [number]);

    return (
        <div className={className}>
            {meteors.map((meteor) => (
                <span
                    key={meteor.id}
                    className="absolute top-0 h-0.5 w-0.5 rotate-[215deg] animate-meteor rounded-full bg-gradient-to-r from-purple-500 to-transparent shadow-[0_0_0_1px_#ffffff10]"
                    style={{
                        left: meteor.left,
                        animationDelay: meteor.animationDelay,
                        animationDuration: meteor.animationDuration,
                    }}
                >
                    <div className="pointer-events-none absolute top-1/2 h-px w-[50px] -translate-y-1/2 bg-gradient-to-r from-purple-500 via-purple-500 to-transparent" />
                </span>
            ))}
        </div>
    );
}
