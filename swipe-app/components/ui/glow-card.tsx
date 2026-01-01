/**
 * Glow Card Component
 * Inspired by codaworks/react-glow and Aceternity UI
 * Features: Mouse-tracking glow effect with customizable colors
 */

"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

interface GlowCardProps {
    children: React.ReactNode;
    className?: string;
    glowColor?: string;
    glowOpacity?: number;
    glowSize?: number;
}

export function GlowCard({
    children,
    className = "",
    glowColor = "rgba(16, 185, 129, 0.3)",
    glowOpacity = 0.5,
    glowSize = 300,
}: GlowCardProps) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    return (
        <div
            ref={cardRef}
            className={`relative overflow-hidden ${className}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* Glow effect */}
            {isHovering && (
                <motion.div
                    className="pointer-events-none absolute"
                    style={{
                        left: mousePosition.x,
                        top: mousePosition.y,
                        width: glowSize,
                        height: glowSize,
                        transform: "translate(-50%, -50%)",
                        background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
                        opacity: glowOpacity,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: glowOpacity }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                />
            )}

            {/* Content */}
            <div className="relative z-10">{children}</div>
        </div>
    );
}

/**
 * Spotlight Card Component
 * Inspired by Magic UI's MagicCard
 * Features: Spotlight effect that follows mouse with gradient highlight
 */

interface SpotlightCardProps {
    children: React.ReactNode;
    className?: string;
    spotlightColor?: string;
    gradientSize?: number;
    gradientOpacity?: number;
}

export function SpotlightCard({
    children,
    className = "",
    spotlightColor = "rgba(255, 255, 255, 0.1)",
    gradientSize = 400,
    gradientOpacity = 0.6,
}: SpotlightCardProps) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    return (
        <div
            ref={cardRef}
            className={`relative overflow-hidden ${className}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* Spotlight gradient */}
            {isHovering && (
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background: `radial-gradient(${gradientSize}px circle at ${mousePosition.x}px ${mousePosition.y}px, ${spotlightColor}, transparent 40%)`,
                        opacity: gradientOpacity,
                    }}
                />
            )}

            {/* Border highlight */}
            {isHovering && (
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background: `radial-gradient(${gradientSize}px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(168, 85, 247, 0.4), transparent 40%)`,
                        maskImage: "linear-gradient(black, black) content-box, linear-gradient(black, black)",
                        maskComposite: "exclude",
                        padding: "1px",
                    }}
                />
            )}

            {/* Content */}
            <div className="relative z-10">{children}</div>
        </div>
    );
}
