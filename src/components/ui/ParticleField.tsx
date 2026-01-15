"use client";

import { motion } from "motion/react";

type ParticleProps = {
  x: number;
  y: number;
  delay: number;
  color: string;
};

function Particle({ x, y, delay, color }: ParticleProps) {
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        backgroundColor: color,
        boxShadow: `0 0 6px ${color}, 0 0 12px ${color}`,
      }}
      animate={{
        y: [0, -30, 0],
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

export default function ParticleField({
  count = 50,
  colors = ["#ff5ec8", "#8f5bff", "#00f6ff"],
}: {
  count?: number;
  colors?: string[];
}) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <Particle
          key={i}
          x={Math.random() * 100}
          y={Math.random() * 100}
          delay={Math.random() * 3}
          color={colors[Math.floor(Math.random() * colors.length)]}
        />
      ))}
    </div>
  );
}
