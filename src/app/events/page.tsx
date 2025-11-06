"use client";
import React from "react";
import { motion } from "framer-motion";
import Header from "../../components/Header";
import PrismaticBurst from "../../components/ui/PrismaticBurst";

const timelineData = [
  "BGMI Tournament",
  "Chess Tournament",
  "Debate Contest",
  "Drone Race Competition",
  "VR Experience",
  "Photography Scavenger Hunt",
  "Dance Face-off",
  "Flying Simulator",
  "Ramp Walk",
  "GSQ (Google Squid Games)",
  "Drone Simulator Competition",
  "AeroCAD Demonstrations",
  "Poster Design Competition",
  "Mobile Robocar Racing",
  "Strongest on Campus",
  "Valorant Tournament – Finals",
];

export default function EventsPage() {
  return (
    <div className="min-h-screen w-full text-white relative overflow-hidden">
      {/* 🌌 Animated Background */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#18003c,_#060014_70%)]"
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ backgroundSize: "400% 400%" }}
      />

      {/* 🌈 Energy Overlay */}
      <div className="absolute inset-0 mix-blend-screen opacity-70 z-0">
        <PrismaticBurst
          intensity={0.6}
          speed={0.6}
          animationType="rotate3d"
          colors={["#ff5ec8", "#8f5bff", "#00f6ff"]}
        />
      </div>

      <Header />

      <main className="max-w-5xl mx-auto px-6  relative">
        {/* Center Timeline Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[3px] bg-gradient-to-b from-pink-500 via-purple-500 to-pink-500 rounded-full opacity-70 z-0" />

        {/* Timeline Items */}
        <ul className="relative z-10 space-y-5 md:space-y-0 mt-10">
          {timelineData.map((event, idx) => {
            const isLeft = idx % 2 === 0;
            return (
              <motion.li
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                viewport={{ once: true }}
                className={`relative flex flex-col md:flex-row items-center ${
                  isLeft ? "md:justify-start" : "md:justify-end"
                }`}
              >
                {/* Connector Dot */}
                <div className="absolute left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border-4 border-[#0d0d10] shadow-lg" />

                {/* Event Card */}
                <div
                  className={`w-full md:w-[45%]  bg-[#1a0e1eb0] border border-[#2c2c38] rounded-2xl p-4 text-center font-semibold text-lg hover:bg-[#20202a] transition-all duration-300 backdrop-blur-sm shadow-lg
                    ${
                      isLeft
                        ? "md:mr-auto md:translate-x-[-8%] "
                        : "md:ml-auto md:translate-x-[8%] "
                    }`}
                >
                  {event}
                </div>
              </motion.li>
            );
          })}
        </ul>
      </main>

      {/* 🪶 Small padding bottom for spacing */}
      <div className="pb-5" />
    </div>
  );
}
