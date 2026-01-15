"use client";

import { motion } from "motion/react";

export default function PulseRings({
  count = 3,
  size = 400,
  color = "#ff5ec8",
}: {
  count?: number;
  size?: number;
  color?: string;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2"
          style={{
            width: size,
            height: size,
            borderColor: color,
            opacity: 0.3,
          }}
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{
            scale: [0, 1.5, 2],
            opacity: [0.6, 0.3, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 1,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
