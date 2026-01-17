"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";

type ParticleProps = {
  x: number;
  y: number;
  delay: number;
  color: string;
  duration: number;
};

function Particle({ x, y, delay, color, duration }: ParticleProps) {
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
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

function hashStringToSeed(input: string) {
  // Small deterministic hash for seeding PRNG (client-only usage).
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function ParticleField({
  count = 50,
  colors = ["#ff5ec8", "#8f5bff", "#00f6ff"],
}: {
  count?: number;
  colors?: string[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const particles = useMemo(() => {
    const seed = hashStringToSeed(`${count}|${colors.join(",")}`);
    const rand = mulberry32(seed);
    return Array.from({ length: count }).map((_, i) => {
      const x = rand() * 100;
      const y = rand() * 100;
      const delay = rand() * 3;
      const duration = 3 + rand() * 2;
      const color = colors[Math.floor(rand() * colors.length)] || colors[0] || "#ffffff";
      return { key: i, x, y, delay, duration, color };
    });
  }, [count, colors]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {mounted &&
        particles.map((p) => (
          <Particle key={p.key} x={p.x} y={p.y} delay={p.delay} duration={p.duration} color={p.color} />
        ))}
    </div>
  );
}
