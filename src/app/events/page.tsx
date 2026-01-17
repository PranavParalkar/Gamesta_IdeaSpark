"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import PrismaticBurst from "../../components/ui/PrismaticBurst";
import AnimatedGrid from "@/components/ui/AnimatedGrid";
import ParticleField from "@/components/ui/ParticleField";

type EventItem = {
  id: number;
  name: string;
  price?: number;
  ticketLimit?: number | null;
  ticketsSold?: number;
  remaining?: number | null;
  createdAt?: string;
};

const ROTATION_RANGE = 32.5;
const HALF_ROTATION_RANGE = ROTATION_RANGE / 2;

function EventTiltCard({
  event,
  index,
  onClick,
  image,
}: {
  event: EventItem;
  index: number;
  onClick: () => void;
  image: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, { stiffness: 200, damping: 20 });
  const ySpring = useSpring(y, { stiffness: 200, damping: 20 });

  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = (e.clientX - rect.left) * ROTATION_RANGE;
    const mouseY = (e.clientY - rect.top) * ROTATION_RANGE;

    const rX = (mouseY / height - HALF_ROTATION_RANGE) * -1;
    const rY = mouseX / width - HALF_ROTATION_RANGE;

    x.set(rX);
    y.set(rY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        transform,
      }}
      initial={{ opacity: 0, y: 25, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className="relative h-64 w-full rounded-2xl bg-gradient-to-br from-indigo-400/60 via-fuchsia-500/60 to-cyan-400/60 p-[1px] "
      onClick={onClick}
    >
      <div
        style={{
          transform: "translateZ(60px)",
          transformStyle: "preserve-3d",
        }}
        className="relative h-full w-full rounded-2xl bg-[#050816]/95 border border-white/10 overflow-hidden"
      >
        {/* Background image from event */}
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-60"
          style={{
            backgroundImage: `url('${image}')`,
          }}
        />

        {/* Optional overlay for better text contrast */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
{/* 
        <div className="pointer-events-none absolute -right-16 -top-16 w-32 h-32 rounded-full bg-fuchsia-500/30 blur-2" />
        <div className="pointer-events-none absolute -left-20 bottom-0 w-40 h-40 rounded-full bg-cyan-400/25 blur-2" /> */}

        <div className="relative flex h-full flex-col justify-between p-5">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-white/60">
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                #{index + 1}
              </span>
              <span>Gamesta event</span>
            </div>
            <h2
              style={{ transform: "translateZ(40px)" }}
              className="mt-3 text-lg md:text-2xl font-semibold"
            >
              {event.name}
            </h2>
          </div>

          <div className="flex items-center justify-between text-xs md:text-sm text-white/70">
        
            <span
              style={{ transform: "translateZ(45px)" }}
              className="hidden md:inline-flex text-[10px] uppercase tracking-[0.3em] text-cyan-300/90"
            >
              Click to open
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function EventsPage() {
  // Hardcoded events with images - matching home page items
  const hardcodedEvents: EventItem[] = [
    {
      id: 1,
      name: 'BGMI Tournament',
      price: 0,
      ticketLimit: null,
      ticketsSold: 0,
      remaining: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Chess Tournament',
      price: 0,
      ticketLimit: null,
      ticketsSold: 0,
      remaining: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 3,
      name: 'Dance Face-off',
      price: 0,
      ticketLimit: null,
      ticketsSold: 0,
      remaining: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 4,
      name: 'Debate Contest',
      price: 0,
      ticketLimit: null,
      ticketsSold: 0,
      remaining: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 5,
      name: 'Drone Race Competition',
      price: 0,
      ticketLimit: null,
      ticketsSold: 0,
      remaining: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 6,
      name: 'Flying Simulator',
      price: 0,
      ticketLimit: null,
      ticketsSold: 0,
      remaining: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 7,
      name: 'GSQ (Google Squid Games)',
      price: 0,
      ticketLimit: null,
      ticketsSold: 0,
      remaining: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 8,
      name: 'Mobile Robocar Racing',
      price: 0,
      ticketLimit: null,
      ticketsSold: 0,
      remaining: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 9,
      name: 'Photography Hunt',
      price: 0,
      ticketLimit: null,
      ticketsSold: 0,
      remaining: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 10,
      name: 'Ramp Walk',
      price: 0,
      ticketLimit: null,
      ticketsSold: 0,
      remaining: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 11,
      name: 'Strongest on Campus',
      price: 0,
      ticketLimit: null,
      ticketsSold: 0,
      remaining: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 12,
      name: 'Valorant Tournament',
      price: 0,
      ticketLimit: null,
      ticketsSold: 0,
      remaining: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 13,
      name: 'VR Experience',
      price: 0,
      ticketLimit: null,
      ticketsSold: 0,
      remaining: null,
      createdAt: new Date().toISOString(),
    },
  ];

  const eventImages: { [key: number]: string } = {
    1: '/Event_Images/BGMI.png',
    2: '/Event_Images/Chess.png',
    3: '/Event_Images/Dance.png',
    4: '/Event_Images/Debate.png',
    5: '/Event_Images/Drone.png',
    6: '/Event_Images/Flying.png',
    7: '/Event_Images/Squid.png',
    8: '/Event_Images/Robocar.png',
    9: '/Event_Images/Photography.png',
    10: '/Event_Images/Ramp.png',
    11: '/Event_Images/Strongest.png',
    12: '/Event_Images/Valo.png',
    13: '/Event_Images/VR.png',
  };

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEvent, setActiveEvent] = useState<EventItem | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Set hardcoded events immediately
    setEvents(hardcodedEvents);
    setLoading(false);
  }, []);

  const handleRegister = () => {
    if (!activeEvent) {
      router.push("/registrations");
      return;
    }
    router.push(`/registrations?eventId=${activeEvent.id}`);
  };

  return (
    <div className="min-h-screen w-full text-white relative overflow-hidden">
      {/* Neon energy background */}
      <div className="absolute inset-0 mix-blend-screen opacity-70 z-0 pointer-events-none">
        <PrismaticBurst
          intensity={0.6}
          speed={0.6}
          animationType="rotate3d"
          colors={["#ff5ec8", "#8f5bff", "#00f6ff"]}
        />
      </div>

      <main className="relative max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-16 z-10">
    

        {/* Tilt card grid */}
        <section className="mt-6">
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => (
                <div
                  key={i}
                  className="h-64 w-full rounded-2xl bg-white/5 animate-pulse"
                />
              ))}
            </div>
          )}

          {!loading && events.length === 0 && (
            <div className="text-center text-white/70 py-10 glass rounded-2xl">
              No events found right now. Check back soon.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {!loading &&
              events.map((event, idx) => (
                <EventTiltCard
                  key={event.id ?? idx}
                  event={event}
                  index={idx}
                  image={eventImages[event.id as keyof typeof eventImages] || '/Event_Images/BGMI.png'}
                  onClick={() => setActiveEvent(event)}
                />
              ))}
          </div>
        </section>

        {/* Popup modal for more info + register */}
        {/* <AnimatePresence>
          {activeEvent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm"
              onClick={() => setActiveEvent(null)}
            >
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="relative w-full max-w-md rounded-3xl bg-[#050816]/95 border border-white/15 px-6 py-6 md:px-8 md:py-8 shadow-[0_0_40px_rgba(59,130,246,0.7)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-fuchsia-500/40 via-purple-500/40 to-cyan-400/40 opacity-60 blur-sm -z-10" />

                <div className="flex items-start justify-between gap-4 mb-4">
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                    {activeEvent.name}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveEvent(null)}
                    className="text-white/60 hover:text-white text-sm"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-sm md:text-base text-white/75">
                  {activeEvent.createdAt && (
                    <div className="text-xs text-white/60">
                      Added on{" "}
                      <span className="text-white">
                        {new Date(activeEvent.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <p>
                    This event is part of the{" "}
                    <span className="text-fuchsia-300 font-medium">
                      Gamesta
                    </span>{" "}
                    universe. If you&apos;re interested in joining, continue to
                    the registration page where you&apos;ll see full pricing and
                    ticket options.
                  </p>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleRegister}
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 text-sm md:text-base font-semibold  transition-all duration-300 hover:-translate-y-1.5"
                  >
                    Register for Events
                  </button>

           
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence> */}
        {/* FULL SCREEN VALORANT EVENT MODAL */}
<AnimatePresence>
  {activeEvent?.name === "Valorant Tournament" && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-[#070711]"
    >
      {/* ================= BACKGROUND LAYERS ================= */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Soft gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#120c2e] via-[#070711] to-[#04131a]" />

    

        {/* Subtle grain */}
        <div className="absolute inset-0 opacity-[0.04] bg-noise" />
      </div>

      <div className="relative text-white">
        {/* ================= HERO ================= */}
        <section className="relative min-h-screen flex items-center px-6">
          <div className="max-w-6xl mx-auto items-center">
            {/* Left */}
            <motion.div
              initial={{ x: -80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto text-center"
            >
              <span className="inline-block mb-6 text-sm tracking-widest text-fuchsia-400 uppercase">
                Gamesta presents
              </span>

              <h1 className="text-6xl md:text-7xl font-black leading-tight">
                <span className="block text-white">Valorant</span>
                <span className="block bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                  Tournament
                </span>
              </h1>

              <p className="mt-6 text-lg text-white/70 max-w-xl">
                A multi-stage competitive Valorant experience — from online
                knockouts to a high-stakes LAN finale on campus.
              </p>

              <div className="mt-10 flex gap-4 items-center justify-center">
                <button
                  onClick={handleRegister}
                  className="px-8 py-4 bg-white text-black font-semibold rounded-lg hover:-translate-y-1 transition"
                >
                  Register
                </button>
                <button className="px-8 py-4 border border-white/20 rounded-lg text-white/80 hover:bg-white/10 transition">
                  View Rules
                </button>
              </div>
            </motion.div>
       
          </div>

          {/* Close */}
          <button
            onClick={() => setActiveEvent(null)}
                    className="absolute top-16 border-2 p-2 rounded-full right-8 text-white/60 hover:text-white"
          >
            ✕
          </button>
        </section>

        {/* ================= PHASES ================= */}
        <section className="relative max-w-6xl mx-auto px-6 py-40 space-y-40">
          {[
            {
              n: "01",
              title: "Team Formation",
              date: "14 Jan – 31 Jan, The team registrations will start from 1 Feb Onwards.",
              color: "from-fuchsia-400 to-purple-500",
              text:
                "The team is very important for winning a tournament. If you do, start practicing. If you don't, we got you. Gamesta discord will be a hub for players finding the best fit players as per their team. You will assign roles to yourself i.e Duelist, Controller etc and search among the Voice channels from the Gamesta Discord.",
            },
            {
              n: "02",
              title: "Online Knockouts",
              date: "6 Weeks · Weekends",
              color: "from-purple-400 to-cyan-400",
              text:
                "All registered teams will be placed in Randomized Brackets. The format of the Online Phase purely knock outs in Competitive format. Singular Map will be selected with the map poll.These will continue for a total of 6 weeks and the matches will be scheduled around the weekends. Player can play from Home or Gamesta-collaborated Gaming Cafe's.8 finalist team will move forward to the next phase.",
            },
            {
              n: "03",
              title: "LAN Grand Finale",
              date: "MITAOE Campus",
              color: "from-cyan-400 to-fuchsia-400",
              text:
                "All the Shortlisted team will be competing in Campus for the Final Showdown. LAN phase will have three stages , Quarter's , Semi's and the Finals on campus of MIT Academy of Engineering, Alandi.",
            },
          ].map((p, i) => (
            <motion.div
              key={p.n}
              initial={{ y: 120, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative grid md:grid-cols-[120px_1fr] gap-12"
            >
              {/* Number */}
              <div className="text-7xl font-black text-white/10">
                {p.n}
              </div>

              {/* Content */}
              <div>
                <h3 className="text-4xl font-bold mb-3">{p.title}</h3>
                <div
                  className={`h-1 w-24 mb-6 bg-gradient-to-r ${p.color}`}
                />
                <p className="text-sm uppercase tracking-widest text-white/40 mb-6">
                  {p.date}
                </p>
                <p className="text-lg text-white/70 max-w-2xl">
                  {p.text}
                </p>
              </div>
            </motion.div>
          ))}
        </section>

        {/* ================= CTA ================= */}
        <section className="relative py-32 flex justify-center">
          <motion.button
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 160 }}
            onClick={handleRegister}
            className="relative px-16 py-5 text-lg font-semibold rounded-xl bg-gradient-to-r from-fuchsia-400 to-cyan-400 text-black"
          >
            Register Your Team
          </motion.button>
        </section>

        <div className="h-32" />
      </div>
    </motion.div>
  )}
</AnimatePresence>



      </main>
    </div>
  );
}
