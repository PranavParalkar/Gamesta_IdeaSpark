"use client";

import { motion } from "motion/react";

export default function AnimatedGrid() {
  const lines = Array.from({ length: 20 });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff5ec8" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#8f5bff" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#00f6ff" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {lines.map((_, i) => (
          <motion.line
            key={`h-${i}`}
            x1="0"
            y1={`${(i * 100) / lines.length}%`}
            x2="100%"
            y2={`${(i * 100) / lines.length}%`}
            stroke="url(#gridGradient)"
            strokeWidth="0.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: 1,
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
          />
        ))}
        {lines.map((_, i) => (
          <motion.line
            key={`v-${i}`}
            x1={`${(i * 100) / lines.length}%`}
            y1="0"
            x2={`${(i * 100) / lines.length}%`}
            y2="100%"
            stroke="url(#gridGradient)"
            strokeWidth="0.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: 1,
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
    </div>
  );
}
