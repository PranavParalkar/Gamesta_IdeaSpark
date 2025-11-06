"use client";
import React, { useState, useRef, useEffect } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/Button";
import PrismaticBurst from "../../components/ui/PrismaticBurst";
import Header from "../../components/Header";
import toast from "react-hot-toast";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "../../components/ui/Card";
import { FaFire } from "react-icons/fa";
import { BiTime, BiUpArrowAlt } from "react-icons/bi";
import { RiCalendarTodoFill } from "react-icons/ri";
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi";

// -----------------------------
// Fetcher (same as original)
// -----------------------------
const fetcher = (url: string) => {
  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("gamesta_token")
      : null;
  return fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  }).then((r) => r.json());
};

// -----------------------------
// Timeline data (from user)
// -----------------------------
const timelineData = {
  saturday: [
    { time: "9:00 AM – 10:30 AM", event: "Inauguration Ceremony & Opening Address", club: "—" },
    { time: "10:30 AM – 1:00 PM", event: "BGMI Tournament – Phase 1", club: "Vertex GDNA" },
    { time: "10:30 AM – 1:00 PM", event: "Chess Tournament – Rapid Format", club: "Chess Club" },
    { time: "10:30 AM – 1:00 PM", event: "Debate Contest", club: "Nekotachi Podcast Club" },
    { time: "1:00 PM – 2:00 PM", event: "Lunch Break", club: "—" },
    { time: "2:00 PM – 4:00 PM", event: "Drone Competition", club: "Drone Club MITAOE" },
    { time: "2:00 PM – 4:00 PM", event: "VR Experience", club: "SPARK" },
    { time: "2:00 PM – 4:00 PM", event: "Photography Scavenger Hunt", club: "Shutterbugs" },
    { time: "4:00 PM – 6:00 PM", event: "Dance Workshop & Freestyle Dance", club: "Menace Dance Club" },
    { time: "4:00 PM – 6:00 PM", event: "Flying Simulator", club: "Aero Club MITAOE" },
    { time: "6:00 PM – 7:00 PM", event: "Ramp Walk", club: "Foreign Language Club" },
  ],
  sunday: [
    { time: "9:00 AM – 10:30 AM", event: "Chess Tournament – Classic & Blitz Finals", club: "Chess Club" },
    { time: "10:30 AM – 12:00 PM", event: "GSQ (Google Squid Games)", club: "Google Developer Group" },
    { time: "10:30 AM – 12:00 PM", event: "Drone Simulator Competition", club: "Drone Club MITAOE" },
    { time: "12:00 PM – 1:00 PM", event: "AeroCAD Demonstrations", club: "Aero Club MITAOE" },
    { time: "12:00 PM – 1:00 PM", event: "Poster Design Competition", club: "Ajaanvriksha" },
    { time: "1:00 PM – 2:00 PM", event: "Lunch Break", club: "—" },
    { time: "2:00 PM – 3:30 PM", event: "Mobile Robocar Racing", club: "Invictus Robotics" },
    { time: "2:00 PM – 3:30 PM", event: "Strongest on Campus", club: "Rotaract Club of MITAOE" },
    { time: "3:30 PM – 4:30 PM", event: "BGMI Tournament – Finals", club: "Vertex GDNA" },
    { time: "4:30 PM – 6:00 PM", event: "Valorant Tournament – Finals", club: "Vertex GDNA" },
    { time: "6:00 PM – 6:30 PM", event: "Closing Ceremony & Prize Distribution", club: "—" },
  ],
};

// -----------------------------
// Timeline item component
// -----------------------------
function TimelineItem({ item, index }: { item: any; index: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      viewport={{ once: true }}
      className="mb-6 last:mb-0 relative"
    >
      <div className="absolute -left-8 top-1/2 transform -translate-y-1/2">
        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 shadow-lg" />
      </div>

      <div className="ml-4 p-4 rounded-2xl bg-white/5 border border-white/8 backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-purple-200">{item.time}</p>
            <h4 className="text-lg font-semibold text-white/95 mt-1">{item.event}</h4>
            <p className="text-sm text-gray-300 mt-1">Club: {item.club}</p>
          </div>
        </div>
      </div>
    </motion.li>
  );
}

// -----------------------------
// Timeline panel component
// -----------------------------
function TimelinePanel({ day, onClose }: { day: "saturday" | "sunday"; onClose?: () => void }) {
  const items = timelineData[day];
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="p-4 rounded-2xl bg-gradient-to-b from-white/3 to-white/2 border border-white/8 shadow-md"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <RiCalendarTodoFill className="w-6 h-6 text-pink-400" />
          <h3 className="text-lg font-bold text-white capitalize">{day}</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <HiOutlineChevronDown className="w-6 h-6" />
          </button>
        )}
      </div>

      <ol className="ml-4 border-l border-white/6 pl-6">
        {items.map((it, idx) => (
          <TimelineItem key={idx} item={it} index={idx} />
        ))}
      </ol>
    </motion.div>
  );
}

// -----------------------------
// Main page (original content + timeline)
// -----------------------------
export default function IdeasPageWithTimeline() {
  const { data: ideasData, mutate } = useSWR("/api/ideas", fetcher);
  const [animating, setAnimating] = useState<Record<number, boolean>>({});
  const [sort, setSort] = useState<"recent" | "popular">("popular");
  const [selectedDay, setSelectedDay] = useState<"saturday" | "sunday">("saturday");
  const [timelineOpen, setTimelineOpen] = useState(true);
  const [showTimeline, setShowTimeline] = useState(false);

  // Refs to scroll to idea cards
  const ideaRefs = useRef<Record<number, HTMLDivElement | null>>({});

  async function vote(id: number) {
    const token =
      typeof window !== "undefined"
        ? sessionStorage.getItem("gamesta_token")
        : null;
    if (!token) {
      toast.error("Please sign in to vote");
      return;
    }

    setAnimating((s) => ({ ...s, [id]: true }));
    toast.success("Voted ✔️");

    try {
      const res = await fetch(`/api/ideas/${id}/vote`, {
        method: "POST",
        body: JSON.stringify({ ideaId: id, vote: 1 }),
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Vote failed");
      mutate();
    } catch {
      toast.error("Vote failed. Try again.");
    } finally {
      setTimeout(() => {
        setAnimating((s) => {
          const copy = { ...s };
          delete copy[id];
          return copy;
        });
      }, 700);
    }
  }

  const sortedIdeas =
    ideasData?.data?.sort((a: any, b: any) =>
      sort === "popular" ? b.score - a.score : b.id - a.id
    ) || [];

  // Smooth scroll to idea
  const scrollToIdea = (id: number) => {
    const element = ideaRefs.current[id];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      // tiny pulse animation could be added here
      element.animate(
        [
          { boxShadow: "0 0 0px rgba(124,58,237,0)" },
          { boxShadow: "0 8px 30px rgba(124,58,237,0.18)" },
          { boxShadow: "0 0 0px rgba(124,58,237,0)" },
        ],
        { duration: 700 }
      );
    }
  };

  // small effect to close timeline on tiny screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setTimelineOpen(false);
      else setTimelineOpen(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      {/* 🌌 Background - Make it fixed and full-screen */}
      <div className="fixed inset-0 -z-10">
        <PrismaticBurst
          intensity={0.6}
          speed={0.8}
          animationType="wave"
          colors={["#ff5ec8", "#7a5cff", "#00f6ff"]}
          mixBlendMode="screen"
        />
      </div>

      {/* Fixed Header */}
      <div className="sticky top-3 z-50">
        <Header />
      </div>

      {/* Main Layout Container */}
      <div className="relative z-10 flex min-h-[calc(100vh-80px)]">
        {/* 🧭 Left Ranking Sidebar */}
        {sortedIdeas.length > 0 && (
          <aside className="hidden md:flex flex-col items-center sticky top-24 h-[calc(100vh-6rem)] pt-24 pl-6 w-24">
            <div className="absolute top-0  w-1 bg-gradient-to-b from-purple-500 via-pink-500 to-transparent h-full rounded-full" />
            <div className="flex flex-col gap-6 relative z-10">
              {sortedIdeas.map((idea: any, index: number) => (
                <motion.button
                  key={idea.id}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => scrollToIdea(idea.id)}
                  className="relative w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold rounded-full flex items-center justify-center shadow-lg hover:shadow-pink-400/30 transition"
                >
                  #{index + 1}
                </motion.button>
              ))}
            </div>
          </aside>
        )}

        {/* 🌟 Main Content */}
        <main className="flex-1 px-6 py-12">
          <div className="max-w-8xl mx-auto">
            <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">
                  Community Ideas
                </h1>
              </div>

              {/* Timeline Toggle Button */}
              <div className="flex items-center gap-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowTimeline(!showTimeline)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    showTimeline 
                      ? "bg-gradient-to-r from-purple-700 to-pink-700 text-white"
                      : "bg-gradient-to-r from-purple-500 to-pink-500 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  
                  {showTimeline ? (
                   
                      <RiCalendarTodoFill className="my-1 rounded-full"/>
                     
                  ) : (
                    <div className="flex flex-row gap-3">
                      <RiCalendarTodoFill className={`w-5 h-5 ${showTimeline ? "text-white" : "text-gray-300"}`} />
                  <span className="tracking-widest font-bold">Timeline</span>
                      <HiOutlineChevronDown className="w-5 h-5" />
                      </div>
                  )}
                </motion.button>

                {showTimeline && (
                  <div className="flex items-center ">
                    <button
                      onClick={() => setSelectedDay("saturday")}
                      className={`px-3 py-2 rounded-l-lg ${
                        selectedDay === "saturday"
                          ? "font-bold bg-gradient-to-r from-purple-900 to-pink-500 text-white"
                          : "bg-gradient-to-r from-purple-900 to-pink-500 text-gray-300 hover:bg-white/20 "
                      }`}
                    >
                      SAT
                    </button>
              
                    <button
                      onClick={() => setSelectedDay("sunday")}
                      className={`px-3 py-2 rounded-r-lg ${
                        selectedDay === "sunday"
                          ? "font-bold bg-gradient-to-r from-pink-500 to-purple-900 text-white"
                          : "bg-gradient-to-r from-pink-500 to-purple-900 text-gray-300 hover:bg-white/20 "
                      }`}
                    >
                      SUN
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className={`grid gap-6 ${
              showTimeline ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {/* Ideas Grid - Spans all columns when timeline is hidden */}
              <div className={showTimeline ? 'lg:col-span-2' : 'md:col-span-2 lg:col-span-3'}>
                {!ideasData ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-60 bg-white/10 rounded-2xl border border-white/10"
                      ></div>
                    ))}
                  </div>
                ) : sortedIdeas.length === 0 ? (
                  <div className="text-center py-16 text-gray-300">
                    <h3 className="text-2xl font-semibold mb-2">No ideas yet 😕</h3>
                    <p>Be the first to share something amazing!</p>
                    <Button className="mt-4">Submit Idea</Button>
                  </div>
                ) : (
                  <div className={`columns-1 sm:columns-2 gap-6 space-y-6 ${
                    showTimeline ? 'lg:columns-2' : 'lg:columns-3'
                  }`}>
                    {sortedIdeas.map((idea: any, index: number) => (
                      <motion.div
                        key={idea.id}
                        ref={(el) => { ideaRefs.current[idea.id] = el; }}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.02 }}
                        viewport={{ once: true }}
                      >
                        <Card className="relative mb-6 break-inside-avoid bg-white/10 border border-white/10 rounded-2xl backdrop-blur-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-transform hover:scale-[1.02] dur">
                          <CardHeader>
                            <CardTitle className="text-xl text-white mb-2">
                              {idea.title}
                            </CardTitle>
                            <p className="text-sm text-purple-300 font-medium">
                              Score: {idea.score}
                            </p>
                          </CardHeader>

                          <CardContent>
                            <CardDescription className="text-base text-gray-300 mb-4">
                              {idea.description}
                            </CardDescription>

                            <div className="flex items-center justify-between pt-3 border-t border-white/10">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => vote(idea.id)}
                                className="flex items-center gap-2 text-sm px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-semibold shadow-lg hover:shadow-purple-500/25"
                              >
                                <BiUpArrowAlt className="w-4 h-4" />
                                Upvote
                              </motion.button>
                              <span className="text-xs text-gray-400">#{index + 1}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Timeline Panel - Only shown when toggled */}
              {showTimeline && (
                <aside className="lg:col-span-1 sticky top-28 h-fit">
                  <TimelinePanel 
                    day={selectedDay} 
                    onClose={() => setShowTimeline(false)}
                  />
                </aside>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
