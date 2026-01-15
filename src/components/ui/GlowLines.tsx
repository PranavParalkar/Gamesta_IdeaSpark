"use client";

import { motion } from "motion/react";

export default function GlowLines() {
  const lines = Array.from({ length: 8 });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff5ec8" stopOpacity="0" />
            <stop offset="50%" stopColor="#ff5ec8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8f5bff" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {lines.map((_, i) => {
          const angle = (i * Math.PI * 2) / lines.length;
          const length = 300;
          const centerX = 50;
          const centerY = 50;
          const x1 = centerX + Math.cos(angle) * 20;
          const y1 = centerY + Math.sin(angle) * 20;
          const x2 = centerX + Math.cos(angle) * length;
          const y2 = centerY + Math.sin(angle) * length;

          return (
            <motion.line
              key={i}
              x1={`${x1}%`}
              y1={`${y1}%`}
              x2={`${x2}%`}
              y2={`${y2}%`}
              stroke="url(#glowGradient)"
              strokeWidth="2"
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}
