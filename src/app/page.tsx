"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import BlurText from "../components/ui/BlurText";
import Antigravity from "./Antigravity";
import PrismaticBurst from "../components/ui/PrismaticBurst";
import FloatingOrbs from "../components/ui/FloatingOrbs";
import AnimatedGrid from "../components/ui/AnimatedGrid";
import PulseRings from "../components/ui/PulseRings";
import GlowLines from "../components/ui/GlowLines";
import ParticleField from "../components/ui/ParticleField";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import Sparkline from "../components/ui/Sparkline";
import ChatBot from "../components/ChatBot";
import InfiniteMenu from '../components/InfiniteMenu'

export default function Home() {
  const items = [
  {
    image: '/Event_Images/BGMI.png',
    link: '/events',
    title: 'BGMI Tournament',
    description: 'Compete in an intense BGMI battle and prove your squad\'s dominance.'
  },
  {
    image: '/Event_Images/Chess.png',
    link: '/events',
    title: 'Chess Tournament',
    description: 'Test your strategy and intellect in a competitive chess showdown.'
  },
  {
    image: '/Event_Images/Dance.png',
    link: '/events',
    title: 'Dance Face-off',
    description: 'Show your moves and energy in a high-voltage dance battle.'
  },
  {
    image: '/Event_Images/Debate.png',
    link: '/events',
    title: 'Debate Contest',
    description: 'Put your speaking skills and logical thinking to the test.'
  },
  {
    image: '/Event_Images/Drone.png',
    link: '/events',
    title: 'Drone Race Competition',
    description: 'Experience speed and precision in an adrenaline-filled drone race.'
  },
  {
    image: '/Event_Images/Flying.png',
    link: '/events',
    title: 'Flying Simulator',
    description: 'Get hands-on experience with realistic flight simulation.'
  },
  {
    image: '/Event_Images/Squid.png',
    link: '/events',
    title: 'GSQ (Google Squid Games)',
    description: 'Fun, thrilling challenges inspired by Google and Squid Games.'
  },
  {
    image: '/Event_Images/Robocar.png',
    link: '/events',
    title: 'Mobile Robocar Racing',
    description: 'Race your robocar and compete for the fastest finish.'
  },
  {
    image: '/Event_Images/Photography.png',
    link: '/events',
    title: 'Photography Hunt',
    description: 'Capture creativity and complete exciting photography challenges.'
  },
  {
    image: '/Event_Images/Ramp.png',
    link: '/events',
    title: 'Ramp Walk',
    description: 'Walk the ramp with confidence and style.'
  },
  {
    image: '/Event_Images/Strongest.png',
    link: '/events',
    title: 'Strongest on Campus',
    description: 'Showcase your strength and endurance in this power-packed event.'
  },
  {
    image: '/Event_Images/Valo.png',
    link: '/events',
    title: 'Valorant Tournament',
    description: 'Team up and dominate the battlefield in Valorant.'
  },
  {
    image: '/Event_Images/VR.png',
    link: '/events',
    title: 'VR Experience',
    description: 'Dive into immersive virtual reality experiences.'
  }
];

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Global animated background layers */}
      <div className="fixed inset-0 z-0">
       
        {/* <FloatingOrbs count={8} colors={["#ff5ec8", "#8f5bff", "#00f6ff"]} /> */}
        <AnimatedGrid />
        <ParticleField count={60} colors={["#ff5ec8", "#8f5bff", "#00f6ff"]} />
      </div>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Hero Antigravity */}
        <div className="absolute inset-0 z-[1]">
          <div className="hidden md:flex w-full h-full">
            <Antigravity
              count={350}
              magnetRadius={8}
              ringRadius={9}
              waveSpeed={0.5}
              waveAmplitude={1.2}
              particleSize={1.8}
              lerpSpeed={0.06}
              color="#ff5ec8"
              autoAnimate
              particleVariance={1.2}
              rotationSpeed={0.2}
              depthFactor={1.2}
              pulseSpeed={3.5}
              particleShape="capsule"
              fieldStrength={12}
            />
          </div>
        </div>

        {/* Pulse rings in hero */}
        <PulseRings count={4} size={500} color="#ff5ec8" />
        <GlowLines />

        {/* Hero content */}
        <div className="relative z-20 mt-20 px-4 text-center space-y-0 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-black/40 backdrop-blur-md border border-fuchsia-500/40 text-xs uppercase tracking-[0.3em] text-fuchsia-200 shadow-[0_0_20px_rgba(255,94,200,0.4)]"
          >
          
            <span className="text-white/50">·</span>
            <span>Biggest fest at MITAOE</span>
            <span className="text-white/50">·</span>
          </motion.div>

          <motion.div 
            className="relative z-20 flex justify-center items-center"
            initial={{ opacity: 0, scale: 0.8, y: -30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Image
                src="/logo1.png"
                alt="Gamesta Logo"
                width={600}
                height={200}
                className="w-auto h-64 sm:h-52 md:h-56 lg:h-96 object-contain drop-shadow-[0_0_40px_rgba(255,94,200,0.8)]"
                priority
                style={{
                  filter: 'drop-shadow(0 0 30px rgba(255, 94, 200, 0.6)) drop-shadow(0 0 60px rgba(147, 51, 234, 0.4))',
                }}
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-fuchsia-500/20 to-purple-500/20 blur-2xl -z-10"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </motion.div>
{/* 
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className=""
          >
            <BlurText
              text="Where college fest ideas become reality. Submit concepts, vote in real-time, and watch the most electrifying events rise to the top."
              delay={60}
              animateBy="words"
              direction="top"
              className="text-lg md:text-lg text-white/90 leading-relaxed max-w-3xl mx-auto"
            />
          </motion.div> */}

          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-6"
          >
            <Link href="/ideas">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative px-10 py-4 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white text-lg font-semibold shadow-[0_0_40px_rgba(236,72,153,0.8)] overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-400 to-fuchsia-500 opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10">Explore Ideas</span>
              </motion.button>
            </Link>
            <Link href="/submit">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative px-10 py-4 rounded-full border-2 border-purple-400/60 bg-purple-900/30 backdrop-blur-sm text-white text-lg font-semibold hover:bg-purple-800/40 transition-all shadow-[0_0_30px_rgba(147,51,234,0.5)]"
              >
                Submit Your Idea
              </motion.button>
            </Link>
          </motion.div> */}
        </div>
      </section>

      {/* WHAT IS GAMESTA SECTION */}
      <section className="relative z-10 py-20 md:py-32 px-4 bg-black/80 backdrop-blur-sm">
        {/* Section background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <FloatingOrbs count={4} colors={["#8f5bff", "#ff5ec8"]} />
          <ParticleField count={30} colors={["#8f5bff", "#ff5ec8"]} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4"
          >
            <BlurText
              text="What is Gamesta?"
              delay={100}
              animateBy="words"
              direction="top"
              className="text-3xl md:text-4xl font-bold justify-center bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent"
            />
            <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              A gamified platform where your college fest ideas become quests,
              and the crowd decides what goes live on stage.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Idea Arena",
                desc: "Drop your wildest fest ideas — new events, twists on classics, or completely experimental formats. The arena is open 24/7.",
                icon: "💡",
                gradient: "from-pink-500/20 to-fuchsia-500/20",
              },
              {
                title: "Live Voting Engine",
                desc: "Students upvote ideas they love. Gamesta turns that into live leaderboards so coordinators instantly see what the crowd wants.",
                icon: "⚡",
                gradient: "from-purple-500/20 to-pink-500/20",
              },
              {
                title: "Events & Rewards",
                desc: "Ideas that win become real events. Earn reputation, climb the leaderboard, and showcase your name across the fest.",
                icon: "🏆",
                gradient: "from-fuchsia-500/20 to-purple-500/20",
              },
            ].map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <Card
                  transparent
                  hover
                  className={`bg-gradient-to-br ${feature.gradient} border border-white/20 backdrop-blur-md relative overflow-hidden group`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 via-fuchsia-500/0 to-purple-500/0 group-hover:from-pink-500/10 group-hover:via-fuchsia-500/10 group-hover:to-purple-500/10 transition-all duration-500" />
                  <CardHeader className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{feature.icon}</span>
                      <CardTitle className="text-white text-xl">
                        {feature.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10 text-sm text-white/80 leading-relaxed">
                    {feature.desc}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS SECTION WITH ANIMATED BACKGROUND */}
      <section className="relative  overflow-hidden">
    
<div style={{ width: '100%', height: '600px', position: 'relative', overflow: 'hidden' }}>
  <InfiniteMenu items={items}/>
</div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="relative z-10 py-20 md:py-32 px-4 bg-black/90">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <AnimatedGrid />
          <PulseRings count={3} size={600} color="#8f5bff" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4"
          >
            <BlurText
              text="How Gamesta Works"
              delay={100}
              animateBy="words"
              direction="top"
              className="text-3xl md:text-4xl font-bold justify-center bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent"
            />
            <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto">
              Three simple steps to turn your ideas into packed auditoriums.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                label: "Submit",
                text: "Share your fest idea with a short pitch. No formal deck, just the raw concept.",
                color: "#ff5ec8",
              },
              {
                step: "02",
                label: "Vote",
                text: "Friends and students react, vote, and discuss. The best ideas naturally rise.",
                color: "#8f5bff",
              },
              {
                step: "03",
                label: "Go Live",
                text: "Organizers pick from the top ideas and spin them into real‑world events.",
                color: "#00f6ff",
              },
            ].map((item, idx) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 40, rotateX: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                whileHover={{ y: -12, scale: 1.03 }}
                className="relative"
              >
                <Card
                  transparent
                  className="bg-black/60 border border-white/20 backdrop-blur-md h-full relative overflow-hidden group"
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at center, ${item.color}15, transparent 70%)`,
                    }}
                  />
                  <CardHeader className="relative z-10 pb-4">
                    <div className="flex items-center gap-4 mb-3">
                      <motion.span
                        className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 text-lg font-bold"
                        style={{
                          borderColor: item.color,
                          color: item.color,
                          boxShadow: `0 0 20px ${item.color}40`,
                        }}
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        {item.step}
                      </motion.span>
                      <CardTitle className="text-white text-xl md:text-2xl">
                        {item.label}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10 text-sm md:text-base text-white/80 leading-relaxed">
                    {item.text}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center pt-8"
          >
            <Link href="/events">
              <motion.button
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-10 py-4 rounded-full border-2 border-cyan-400/60 text-base md:text-lg text-cyan-100 bg-cyan-500/10 hover:bg-cyan-500/20 backdrop-blur-sm transition-all shadow-[0_0_30px_rgba(34,211,238,0.5)]"
              >
                Explore Live Events Powered by Gamesta
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
