"use client";
import { motion } from "framer-motion";
import useSWR from "swr";
import Header from "../../components/Header";
import PrismaticBurst from "../../components/ui/PrismaticBurst";
import { FaCrown } from "react-icons/fa";

const fetcher = (url: string) => {
  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("gamesta_token")
      : null;
  return fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  }).then((r) => r.json());
};

// 🧠 Avatar generator (Initial letter with random gradient)
function Avatar({ name }: { name: string }) {
  const initial = name?.charAt(0)?.toUpperCase() || "?";
  const gradients = [
    "from-pink-500 to-purple-500",
    "from-cyan-400 to-blue-500",
    "from-yellow-400 to-orange-400",
    "from-emerald-400 to-green-500",
  ];
  const bg = gradients[name.length % gradients.length];
  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white bg-gradient-to-br ${bg} shadow-[0_0_20px_rgba(255,255,255,0.1)]`}
    >
      {initial}
    </div>
  );
}

export default function LeaderboardPage() {
  const { data } = useSWR("/api/leaderboard", fetcher);
  const leaderboard = data?.data || [];
  const top3 = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-[#050015] text-white relative overflow-hidden">
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

      {/* 🏆 Podium Section */}
      <section className="pt-20 text-center relative z-10">
        <div className="flex flex-col md:flex-row justify-center items-center md:items-end gap-6 md:gap-10 mb-20 px-6">
          {/* 2nd Place */}
          {top3[1] && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center order-2 md:order-1"
            >
              <div className="w-32 h-40 md:w-36 md:h-44 rounded-3xl bg-gradient-to-b from-purple-700 to-pink-800 backdrop-blur-xl p-2 border border-white/10 flex flex-col justify-end relative shadow-[0_0_30px_rgba(160,100,255,0.2)]">
                <motion.div
                  className="mx-auto -translate-y-0 text-4xl md:text-5xl text-purple-300 drop-shadow-[0_0_15px_rgba(160,100,255,0.5)]"
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  🥈
                </motion.div>
                <div className="text-base md:text-lg font-semibold mt-2 truncate px-1">
                  {top3[1].title}
                </div>
                <div className="text-purple-400 font-bold mt-1 text-sm md:text-base">
                  {top3[1].score ?? 0} pts
                </div>
              </div>
            </motion.div>
          )}

          {/* 1st Place */}
          {top3[0] && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center order-1 md:order-2 scale-110 md:scale-125"
            >
              <div className="w-36 h-48 md:w-40 md:h-56 rounded-3xl bg-gradient-to-b from-purple-900 to-pink-700 backdrop-blur-xl p-3 border border-white/10 flex flex-col justify-end relative shadow-[0_0_40px_rgba(255,220,130,0.25)]">
                <motion.div
                  className="mx-auto -translate-y-3 text-5xl md:text-7xl text-yellow-300 drop-shadow-[0_0_25px_rgba(255,230,120,0.6)]"
                  animate={{ scale: [1, 1.1, 1], y: [0, -6, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  🥇
                </motion.div>
                <div className="text-base md:text-lg font-semibold mt-2 truncate px-1">
                  {top3[0].title}
                </div>
                <div className="text-yellow-400 font-bold mt-1 text-sm md:text-base">
                  {top3[0].score ?? 0} pts
                </div>
              </div>
            </motion.div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <motion.div
              initial={{ y: 70, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center order-3"
            >
              <div className="w-32 h-40 md:w-36 md:h-44 rounded-3xl bg-gradient-to-b from-purple-700 to-pink-700 backdrop-blur-xl p-2 border border-white/10 flex flex-col justify-end relative shadow-[0_0_30px_rgba(255,120,200,0.2)]">
                <motion.div
                  className="mx-auto -translate-y-3 text-4xl md:text-5xl text-pink-300 drop-shadow-[0_0_15px_rgba(255,120,200,0.5)]"
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  🥉
                </motion.div>
                <div className="text-base md:text-lg font-semibold mt-2 truncate px-1">
                  {top3[2].title}
                </div>
                <div className="text-pink-400 font-bold mt-1 text-sm md:text-base">
                  {top3[2].score ?? 0} pts
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* 🧾 Leaderboard Table */}
      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-24">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.05)]">
          <div className="px-4 md:px-6 py-4 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-0">
            <h2 className="text-base md:text-lg font-semibold flex items-center gap-2 text-white/90">
              🧠 Leaderboard Rankings
            </h2>
            <div className="text-xs text-white/50">Auto Synced</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/10">
            {others.map((user: any, idx: number) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.01 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 md:px-6 py-3 hover:bg-white/10 transition gap-2 sm:gap-0"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="text-white/60 font-semibold w-6 sm:w-8">
                    #{user.rank || idx + 4}
                  </div>
                  <Avatar name={user.author_name || "?"} />
                  <div>
                    <div className="font-semibold text-sm md:text-base">
                      {user.author_name}
                    </div>
                    <div className="text-xs text-white/50 italic truncate max-w-[160px] sm:max-w-none">
                      {user.title || "No Title"}
                    </div>
                  </div>
                </div>
                <div className="text-cyan-300 font-bold text-sm md:text-lg sm:ml-auto">
                  {user.score ?? 0} pts
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
