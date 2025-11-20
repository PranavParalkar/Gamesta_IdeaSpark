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
    function getCsrfRaw(): string | null {
      if (typeof document !== 'undefined') {
        const m = document.cookie.match(/(?:^|; )csrf_token=([^;]+)/);
        if (m) {
          try {
            const full = decodeURIComponent(m[1]);
            const parts = full.split('.');
            if (parts.length === 2) return parts[0];
          } catch {}
        }
      }
      try {
        const stored = typeof window !== 'undefined' ? sessionStorage.getItem('gamesta_csrf') : null;
        if (stored) return stored;
      } catch {}
      return null;
    }
    const csrfRaw = getCsrfRaw();
    if (!csrfRaw) {
      toast.error('Missing CSRF token. Please re-login.');
      // rollback optimistic update immediately
      setVotedIds((prev) => {
        const next = new Set(prev);
        alreadyVoted ? next.add(id) : next.delete(id);
        return next;
      });
      setAnimating((s) => ({ ...s, [id]: false }));
      return;
    }
    const res = await fetch(`/api/ideas/${id}/vote`, {
      method: "POST",
      body: JSON.stringify({ ideaId: id, vote: 1 }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-csrf-token": csrfRaw,
      },
      credentials: 'include',
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || "Vote failed");
    toast.success(alreadyVoted ? "Vote removed ❌" : "Voted ✅");

    // 🔄 Update score locally without full list refetch
    if (json?.stats) {
      mutate(
        (current: any) => {
          if (!current?.data) return current;
          return {
            ...current,
            data: current.data.map((idea: any) =>
              idea.id === id
                ? { ...idea, score: json.stats.score }
                : idea
            ),
          };
        },
        { revalidate: false }
      );
    }
  } catch (e) {
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

  // When navigated from leaderboard with ?focus=<id> or #idea-<id>, scroll to that idea once data is loaded
  useEffect(() => {
    let targetId: number | null = null;
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const focusParam = sp.get("focus");
      if (focusParam && /^\d+$/.test(focusParam)) targetId = Number(focusParam);
      if (!targetId) {
        const hash = window.location.hash || "";
        const m = hash.match(/#idea-(\d+)/);
        if (m) targetId = Number(m[1]);
      }
    }
    if (targetId && ideasData?.data?.length) {
      // delay slightly to ensure refs are set after render
      const t = setTimeout(() => scrollToIdea(targetId as number), 60);
      return () => clearTimeout(t);
    }
  }, [ideasData]);

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
          <aside
            role="navigation"
            aria-label="Idea rankings"
            className="hidden fixed md:flex flex-col items-center pt-5  h-[calc(120vh-6rem)]  pl-4 w-24"
          >
            {/* vertical accent line */}
            <div className="absolute top-0 left-12 w-1 bg-gradient-to-b from-purple-500 via-pink-500 to-transparent h-full rounded-full" />

            {/* scrollable list */}
            <div
              className="relative z-10 w-full max-h-[calc(120vh-12rem)] overflow-y-auto py-4 pr-2 flex flex-col items-center gap-4 no-scrollbar"
              // optional nice scrollbar if Tailwind scrollbar plugin is available
            >
              {sortedIdeas.map((idea: any, index: number) => (
                <motion.button
                  key={idea.id}
                  whileHover={{ scale: 1.12 }}
                  onClick={() => scrollToIdea(idea.id)}
                  className="relative flex-none w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold rounded-full flex items-center justify-center shadow-lg hover:shadow-pink-400/30 transition focus:outline-none focus:ring-4 focus:ring-pink-300/30"
                  aria-label={`Scroll to idea ${index + 1}`}
                >
                  #{index + 1}
                </motion.button>
              ))}
            </div>
          </aside>
        )}


        {/* 🌟 Main Content */}
        <main className={`flex-1 px-2 md:px-6 md:pl-28 py-12 ${showTimeline ? "lg:ml-[20rem]" : ""}`}>
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
                        <Card id={`idea-${idea.id}`} className="relative mb-6 break-inside-avoid bg-white/10 border border-white/10 rounded-2xl backdrop-blur-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-transform hover:scale-[1.02]">
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