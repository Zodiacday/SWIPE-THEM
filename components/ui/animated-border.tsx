/**
 * Animated Border Beam Component
 * Inspired by Magic UI's Border Beam
 * Features: Traveling beam of light along borders
 */

"use client";

import React from "react";
import { motion } from "framer-motion";

interface BorderBeamProps {
    className?: string;
    size?: number;
    duration?: number;
    borderWidth?: number;
    colorFrom?: string;
    colorTo?: string;
    delay?: number;
}

export function BorderBeam({
    className = "",
    size = 200,
    duration = 15,
    borderWidth = 1.5,
    colorFrom = "#a855f7",
    colorTo = "#ec4899",
    delay = 0,
}: BorderBeamProps) {
    return (
        <div className={`pointer-events-none absolute inset-0 ${className}`}>
            <motion.div
                className="absolute inset-0"
                style={{
                    background: `linear-gradient(90deg, transparent, ${colorFrom}, ${colorTo}, transparent)`,
                    width: `${size}px`,
                    height: `${borderWidth}px`,
                    top: 0,
                    left: 0,
                }}
                animate={{
                    x: ["-100%", "200%"],
                }}
                transition={{
                    duration,
                    repeat: Infinity,
                    ease: "linear",
                    delay,
                }}
            />
        </div>
    );
}

/**
 * Neon Gradient Card Component
 * Inspired by Magic UI's Neon Gradient Card
 * Features: Glowing neon border with customizable colors
 */

interface NeonCardProps {
    children: React.ReactNode;
    className?: string;
    borderSize?: number;
    borderRadius?: number;
    neonColors?: string[];
}

export function NeonCard({
    children,
    className = "",
    borderSize = 2,
    borderRadius = 16,
    neonColors = ["#a855f7", "#ec4899", "#f97316"],
}: NeonCardProps) {
    return (
        <div
            className={`relative ${className}`}
            style={{
                padding: `${borderSize}px`,
                borderRadius: `${borderRadius}px`,
                background: `linear-gradient(135deg, ${neonColors.join(", ")})`,
            }}
        >
            <div
                className="relative h-full w-full bg-gray-950"
                style={{
                    borderRadius: `${borderRadius - borderSize}px`,
                }}
            >
                {children}
            </div>
        </div>
    );
}

/**
 * Animated Gradient Border Component
 * Features: Rotating conic gradient border
 */

interface AnimatedGradientBorderProps {
    children: React.ReactNode;
    className?: string;
    containerClassName?: string;
    borderClassName?: string;
    duration?: number;
    colors?: string[];
}

export function AnimatedGradientBorder({
    children,
    className = "",
    containerClassName = "",
    borderClassName = "",
    duration = 4,
    colors = ["#a855f7", "#ec4899", "#f97316", "#3b82f6"],
}: AnimatedGradientBorderProps) {
    return (
        <div className={`relative ${containerClassName}`}>
            <motion.div
                className={`absolute inset-0 rounded-2xl ${borderClassName}`}
                style={{
                    background: `conic-gradient(from 0deg, ${colors.join(", ")}, ${colors[0]})`,
                }}
                animate={{
                    rotate: 360,
                }}
                transition={{
                    duration,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
            <div className={`relative m-[2px] rounded-2xl bg-gray-950 ${className}`}>
                {children}
            </div>
        </div>
    );
}
