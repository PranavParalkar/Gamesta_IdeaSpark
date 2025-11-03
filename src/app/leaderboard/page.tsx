"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import useSWR from "swr";
import Header from "../../components/Header";
import PrismaticBurst from "../../components/ui/PrismaticBurst";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";

const fetcher = (url: string) => {
  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("gamesta_token")
      : null;
  return fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  }).then((r) => r.json());
};

export default function LeaderboardPage() {
  const { data } = useSWR("/api/leaderboard", fetcher);
  const { scrollYProgress } = useScroll();
  const lineY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050015] text-white">
      {/* 🌌 Dynamic Neon Gradient Background */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#25043b,_#0a001a_60%)]"
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ backgroundSize: "400% 400%" }}
      />

      {/* 💫 Energy Wave Animation */}
      <motion.div
        className="absolute inset-0 z-0 opacity-60 bg-[url('/waves.svg')] bg-repeat"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      {/* 🌈 Prismatic Light Burst Overlay */}
      <div className="absolute inset-0 z-0 mix-blend-screen opacity-70">
        <PrismaticBurst
          intensity={0.5}
          speed={0.5}
          animationType="rotate3d"
          colors={["#ff5ec8", "#8f5bff", "#00f6ff"]}
        />
      </div>

      {/* ⚡ Scroll Glow Indicator */}
      <motion.div
        style={{ scaleY: lineY }}
        className="fixed left-[6px] top-0 w-[4px] rounded-full bg-gradient-to-b from-cyan-400 via-purple-500 to-pink-500 origin-top shadow-[0_0_20px_rgba(0,255,255,0.5)] z-50"
      />

      <Header />

      <main className="container mx-auto px-4 py-14 relative z-10">
        {/* ✨ Title */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
        >
          <h1 className="text-6xl sm:text-7xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-400">
            Galactic Leaderboard
          </h1>
          <p className="text-white/70 max-w-xl mx-auto text-lg">
            Where innovation meets brilliance — only the brightest ideas shine here.
          </p>
        </motion.div>

        {/* 🔄 Loading Placeholder */}
        {!data && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card
                key={i}
                className="bg-white/5 backdrop-blur-lg border border-white/10 animate-pulse"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="h-6 bg-muted rounded w-1/3"></div>
                    <div className="h-4 bg-muted rounded w-16"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ❌ No Data */}
        {data?.data?.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Card className="bg-white/5 border border-white/10 backdrop-blur-xl">
              <CardContent>
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center text-3xl">
                  🚀
                </div>
                <h3 className="text-2xl font-semibold mb-2">No Entries Yet</h3>
                <p className="text-white/60">
                  Submit your first idea and light up the leaderboard!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 🧊 Main Leaderboard */}
        {data?.data?.length > 0 && (
          <motion.div
            className="overflow-x-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
          >
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.05)]">
              <table className="w-full table-auto text-left text-sm">
                <thead>
                  <tr className="text-xs text-white/60 bg-gradient-to-r from-[#16072a] via-[#22093d] to-[#070d1f] border-b border-white/10">
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Player</th>
                    <th className="px-4 py-3">Idea Title</th>
                    <th className="px-4 py-3 text-right">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data?.map((item: any, idx: number) => {
                    const rank = idx + 1;
                    const medal =
                      rank === 1
                        ? "🥇"
                        : rank === 2
                        ? "🥈"
                        : rank === 3
                        ? "🥉"
                        : "⭐";

                    const glow =
                      rank === 1
                        ? "shadow-[0_0_30px_rgba(255,92,203,0.6)]"
                        : rank === 2
                        ? "shadow-[0_0_30px_rgba(141,92,255,0.6)]"
                        : rank === 3
                        ? "shadow-[0_0_30px_rgba(255,234,92,0.6)]"
                        : "shadow-[0_0_20px_rgba(255,255,255,0.1)]";

                    return (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.15 }}
                        className="border-b border-white/5 last:border-none"
                      >
                        <td className="px-4 py-4">
                          <div
                            className={`w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 via-purple-500 to-cyan-400 flex items-center justify-center text-lg font-bold text-black ${glow}`}
                          >
                            {medal}
                          </div>
                        </td>
                        <td className="px-4 py-4 font-medium">
                          <div>{item.author_name || "—"}</div>
                          <div className="text-xs text-white/50">
                            @{(item.author_name || "")
                              .replace(/\s+/g, "")
                              .toLowerCase()}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-white/90">
                          {item.title}
                        </td>
                        <td className="px-4 py-4 text-right font-bold text-cyan-300 text-lg">
                          {item.score}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* 🌠 Floating Light Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-[3px] h-[3px] bg-cyan-300 rounded-full blur-sm"
              initial={{
                x: Math.random() * 1200,
                y: Math.random() * 1000,
                opacity: 0.3,
              }}
              animate={{
                y: [Math.random() * 1000, Math.random() * -100],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: Math.random() * 12 + 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
