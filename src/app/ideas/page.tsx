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
import { BiUpArrowAlt } from "react-icons/bi";

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

// Timeline removed from ideas page — moved to /events page.

// -----------------------------
// Main page (original content + timeline)
// -----------------------------
export default function IdeasPageWithTimeline() {
  const { data: ideasData, mutate } = useSWR("/api/ideas", fetcher);
  const [animating, setAnimating] = useState<Record<number, boolean>>({});
  const [sort, setSort] = useState<"recent" | "popular">("popular");
  const [showTimeline, setShowTimeline] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date());

  // refs for scrolling to idea cards
  const ideaRefs = useRef<Record<number, HTMLElement | null>>({});

  // track which idea ids the current user has voted for (client-side set)
  const [votedIds, setVotedIds] = useState<Set<number>>(new Set());

async function toggleVote(id: number) {
  const token = typeof window !== "undefined"
    ? sessionStorage.getItem("gamesta_token")
    : null;

  if (!token) {
    toast.error("Please sign in to vote");
    return;
  }

  // ✅ determine future state BEFORE async
  const alreadyVoted = votedIds.has(id);

  // ✅ immediately update UI — no flicker
  setVotedIds((prev) => {
    const next = new Set(prev);
    alreadyVoted ? next.delete(id) : next.add(id);
    return next;
  });

  setAnimating((s) => ({ ...s, [id]: true }));

  try {
    await fetch(`/api/ideas/${id}/vote`, {
      method: "POST",
      // API toggles based on existing vote; it requires vote = 1
      body: JSON.stringify({ ideaId: id, vote: 1 }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    toast.success(alreadyVoted ? "Vote removed ❌" : "Voted ✅");

    // ✅ revalidate data *after* UI is already stable
    mutate(undefined, { revalidate: true });
  } catch {
    toast.error("Could not update vote.");

    // ❗ rollback optimistic update on failure
    setVotedIds((prev) => {
      const next = new Set(prev);
      alreadyVoted ? next.add(id) : next.delete(id);
      return next;
    });
  } finally {
    setAnimating((s) => ({ ...s, [id]: false }));
  }
}



  // initialize votedIds if server provides user-vote flags on ideas
  useEffect(() => {
    if (!ideasData?.data) return;
    const s = new Set<number>();
    ideasData.data.forEach((it: any) => {
      // Support multiple possible API flags; primary is voted_by_you (0/1)
      if (it.voted_by_you || it.userVoted || it.voted_by_user || it.myVote || it.voted) {
        s.add(it.id);
      }
    });
    setVotedIds(s);
  }, [ideasData]);

  const sortedIdeas =
    ideasData?.data?.slice().sort((a: any, b: any) =>
      sort === "popular" ? b.score - a.score : b.id - a.id
    ) || [];

  // Smooth scroll to idea
  const scrollToIdea = (id: number) => {
    const element = ideaRefs.current[id];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      // tiny pulse animation
      try {
        element.animate(
          [
            { boxShadow: "0 0 0px rgba(124,58,237,0)" },
            { boxShadow: "0 8px 30px rgba(124,58,237,0.18)" },
            { boxShadow: "0 0 0px rgba(124,58,237,0)" },
          ],
          { duration: 700 }
        );
      } catch {
        /* ignore if animate not supported */
      }
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* 🌈 Fixed Prismatic Burst Background */}
      <div
        className="fixed inset-0 pointer-events-none mix-blend-screen opacity-70 z-0"
        style={{ overflow: "hidden" }}
      >
        <PrismaticBurst
          intensity={0.6}
          speed={0.6}
          animationType="rotate3d"
          colors={["#ff5ec8", "#8f5bff", "#00f6ff"]}
        />
      </div>

      {/* Main Layout Container */}
      <div className="absolute z-10 mt-12 flex min-h-[calc(100vh-80px)] w-full">
        {/* 🧭 Left Ranking Sidebar */}
        {sortedIdeas.length > 0 && (
          <aside className="hidden md:flex flex-col items-center sticky top-24 h-[calc(100vh-6rem)] pt-24 pl-6 w-24">
            <div className="absolute top-0 w-1 bg-gradient-to-b from-purple-500 via-pink-500 to-transparent h-full rounded-full" />
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
        <main className={`flex-1 px-6 py-12 ${showTimeline ? "lg:ml-[20rem]" : ""}`}>
          <div className="max-w-8xl mx-auto">
            <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">
                  Community Ideas
                </h1>
              </div>

              <div />
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {/* Ideas Grid - Spans all columns when timeline is hidden */}
              <div className="md:col-span-2 lg:col-span-3">
                {!ideasData ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-60 bg-white/10 rounded-2xl border border-white/10"
                      />
                    ))}
                  </div>
                ) : sortedIdeas.length === 0 ? (
                  <div className="text-center py-16 text-gray-300">
                    <h3 className="text-2xl font-semibold mb-2">No ideas yet 😕</h3>
                    <p>Be the first to share something amazing!</p>
                    <Button className="mt-4">Submit Idea</Button>
                  </div>
                ) : (
                  <div className="columns-1 sm:columns-2 gap-6 space-y-6 lg:columns-3">
                    {sortedIdeas.map((idea: any, index: number) => (
                      <motion.div
                        key={idea.id}
                        ref={(el) => { ideaRefs.current[idea.id] = el; }}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.02 }}
                        viewport={{ once: true }}
                      >
                        <Card className="relative mb-6 break-inside-avoid bg-white/10 border border-white/10 rounded-2xl backdrop-blur-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-transform hover:scale-[1.02]">
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
  onClick={() => toggleVote(idea.id)}
  disabled={animating[idea.id] || votedIds.has(idea.id)}
  className={`flex items-center gap-2 text-sm px-4 py-2 rounded-full
    ${votedIds.has(idea.id)
      ? "bg-green-500 cursor-not-allowed"
      : "bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105"
    }`}
>
  {votedIds.has(idea.id) ? "Voted" : "Upvote"}
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

              {/* Timeline moved to /events page */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
