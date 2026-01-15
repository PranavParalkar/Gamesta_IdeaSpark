"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";

type FloatingOrbProps = {
  size?: number;
  color?: string;
  x?: number;
  y?: number;
  duration?: number;
  delay?: number;
};

function FloatingOrb({
  size = 200,
  color = "#ff5ec8",
  x = 0,
  y = 0,
  duration = 20,
  delay = 0,
}: FloatingOrbProps) {
  return (
    <motion.div
      className="absolute rounded-full blur-3xl opacity-30"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}, transparent)`,
        left: `${x}%`,
        top: `${y}%`,
      }}
      animate={{
        x: [
          Math.sin(0) * 50,
          Math.sin(Math.PI / 3) * 50,
          Math.sin((Math.PI * 2) / 3) * 50,
          Math.sin(Math.PI) * 50,
          Math.sin((Math.PI * 4) / 3) * 50,
          Math.sin((Math.PI * 5) / 3) * 50,
          Math.sin(Math.PI * 2) * 50,
        ],
        y: [
          Math.cos(0) * 30,
          Math.cos(Math.PI / 3) * 30,
          Math.cos((Math.PI * 2) / 3) * 30,
          Math.cos(Math.PI) * 30,
          Math.cos((Math.PI * 4) / 3) * 30,
          Math.cos((Math.PI * 5) / 3) * 30,
          Math.cos(Math.PI * 2) * 30,
        ],
        scale: [1, 1.2, 0.8, 1.1, 0.9, 1.2, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
        delay,
      }}
    />
  );
}

export default function FloatingOrbs({
  count = 6,
  colors = ["#ff5ec8", "#8f5bff", "#00f6ff"],
}: {
  count?: number;
  colors?: string[];
}) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <FloatingOrb
          key={i}
          size={150 + Math.random() * 200}
          color={colors[i % colors.length]}
          x={Math.random() * 100}
          y={Math.random() * 100}
          duration={15 + Math.random() * 10}
          delay={Math.random() * 5}
        />
      ))}
    </div>
  );
}
