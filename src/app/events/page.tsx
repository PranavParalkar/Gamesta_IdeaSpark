"use client";
import React from "react";
import { motion } from "framer-motion";
import Header from "../../components/Header";
import PrismaticBurst from "../../components/ui/PrismaticBurst";
import LaserFlow from "../../components/ui/LaserFlow";
// Removed calendar icon import since day labels are hidden

// -----------------------------
// Timeline data
// -----------------------------
const timelineData = {
  saturday: [
    { time: "10:30 AM – 1:00 PM", event: "BGMI Tournament ", club: "Vertex GDNA" },
    { time: "10:30 AM – 1:00 PM", event: "Chess Tournament", club: "Chess Club" },
    { time: "10:30 AM – 1:00 PM", event: "Debate Contest", club: "Nekotachi Podcast Club" },
    { time: "2:00 PM – 4:00 PM", event: "Drone Race Competition", club: "Drone Club MITAOE" },
    { time: "2:00 PM – 4:00 PM", event: "VR Experience", club: "SPARK" },
    { time: "2:00 PM – 4:00 PM", event: "Photography Scavenger Hunt", club: "Shutterbugs" },
    { time: "4:00 PM – 6:00 PM", event: "Dance Face-off", club: "Menace Dance Club" },
    { time: "4:00 PM – 6:00 PM", event: "Flying Simulator", club: "Aero Club MITAOE" },
    { time: "6:00 PM – 7:00 PM", event: "Ramp Walk", club: "Foreign Language Club" },
  ],
  sunday: [
    { time: "10:30 AM – 12:00 PM", event: "GSQ (Google Squid Games)", club: "Google Developer Group" },
    { time: "10:30 AM – 12:00 PM", event: "Drone Simulator Competition", club: "Drone Club MITAOE" },
    { time: "12:00 PM – 1:00 PM", event: "AeroCAD Demonstrations", club: "Aero Club MITAOE" },
    { time: "12:00 PM – 1:00 PM", event: "Poster Design Competition", club: "Ajaanvriksha" },
    { time: "2:00 PM – 3:30 PM", event: "Mobile Robocar Racing", club: "Invictus Robotics" },
    { time: "2:00 PM – 3:30 PM", event: "Strongest on Campus", club: "Rotaract Club of MITAOE" },
    { time: "4:30 PM – 6:00 PM", event: "Valorant Tournament – Finals", club: "Vertex GDNA" },
  ],
};

// Build left/right columns (hide time/day; show only names). Sort alphabetically within each side.
const leftEvents = timelineData.saturday
  .map((e) => ({ event: e.event.trim() }))
  .sort((a, b) => a.event.localeCompare(b.event));

const rightEvents = timelineData.sunday
  .map((e) => ({ event: e.event.trim() }))
  .sort((a, b) => a.event.localeCompare(b.event));

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 -z-10">
        <PrismaticBurst
          intensity={0.6}
          speed={0.8}
          animationType="rotate3d"
          colors={["#ff5ec8", "#7a5cff", "#00f6ff"]}
          mixBlendMode="screen"
        />
      </div>

      {/* Center LaserFlow column: vertical beam from bottom upwards */}
      {/* Positioned within layout below; no global fixed element here */}

      <div className="sticky top-3 z-50">
        <Header />
      </div>

      <main className="flex-1 px-6 pb-16 pt-24">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-12">
          <div className="text-center space-y-3">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Events</h1>
            <p className="text-base text-gray-200 max-w-2xl mx-auto">
              Discover the festival lineup. We’re showcasing the events only—no dates or times—so you can focus on what excites you.
            </p>
          </div>
          <div className="relative w-full">
            <div className="grid gap-8 lg:grid-cols-[minmax(260px,1fr)_220px_minmax(260px,1fr)] items-start">
              {/* Left column */}
              <ul className="space-y-4 order-1">
                {leftEvents.map((it, idx) => (
                  <motion.li
                    key={`L-${it.event}-${idx}`}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.03 }}
                    viewport={{ once: true }}
                  >
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/8 backdrop-blur-md">
                      <h4 className="text-lg font-semibold text-white/95">{it.event}</h4>
                    </div>
                  </motion.li>
                ))}
              </ul>

              {/* Center Laser beam */}
              <div className="relative order-2 h-[70vh] min-h-[520px] flex items-end justify-center">
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-pink-300/50 to-transparent pointer-events-none" />
                <div className="relative w-full max-w-[220px] h-full pointer-events-none">
                  <LaserFlow
                    className="w-full h-full"
                    style={{ height: "100%" }}
                    horizontalBeamOffset={0}
                    verticalBeamOffset={0}
                    wispDensity={1.6}
                    fogIntensity={0.6}
                    fogScale={0.28}
                    color="#FF79C6"
                  />
                </div>
              </div>

              {/* Right column */}
              <ul className="space-y-4 order-3">
                {rightEvents.map((it, idx) => (
                  <motion.li
                    key={`R-${it.event}-${idx}`}
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.03 }}
                    viewport={{ once: true }}
                  >
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/8 backdrop-blur-md">
                      <h4 className="text-lg font-semibold text-white/95">{it.event}</h4>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
