"use client";

import React, { useMemo, useState } from "react";

type OnlineMatch = {
  id: string;
  teamA: string;
  teamB: string;
  week: number;
  note?: string;
};

function makeMatches(count: number): OnlineMatch[] {
  const matches: OnlineMatch[] = [];
  for (let i = 1; i <= count; i++) {
    const week = Math.min(6, Math.max(1, Math.ceil(i / 10)));
    matches.push({
      id: `M${i}`,
      teamA: "TBD",
      teamB: "TBD",
      week,
      note: "Online Knockout",
    });
  }
  return matches;
}

export default function OnlineBrackets({ matchCount = 60 }: { matchCount?: number }) {
  const [weekFilter, setWeekFilter] = useState<number | "all">("all");
  const matches = useMemo(() => makeMatches(matchCount), [matchCount]);

  const filtered = useMemo(() => {
    if (weekFilter === "all") return matches;
    return matches.filter((m) => m.week === weekFilter);
  }, [matches, weekFilter]);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
      <div className="text-sm uppercase tracking-[0.25em] text-white/60">Phase 2 — Online Phase</div>
      <div className="mt-2 text-sm text-white/70">
        Randomized brackets • Knockouts (competitive) • Single map per match (map poll) • Weekends for ~6 weeks • Play from Rapid Rounds Gaming Cafe.
      </div>

      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <div className="text-xs text-white/60">Filter by week:</div>
        <button
          type="button"
          onClick={() => setWeekFilter("all")}
          className={`px-3 py-1.5 rounded-full text-xs border ${weekFilter === "all" ? "border-[#d6b56b]/30 bg-[#d6b56b]/10 text-white" : "border-white/10 bg-white/5 text-white/70"}`}
        >
          All
        </button>
        {[1, 2, 3, 4, 5, 6].map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => setWeekFilter(w)}
            className={`px-3 py-1.5 rounded-full text-xs border ${weekFilter === w ? "border-[#d6b56b]/30 bg-[#d6b56b]/10 text-white" : "border-white/10 bg-white/5 text-white/70"}`}
          >
            Week {w}
          </button>
        ))}

        <div className="ml-auto text-xs text-white/50">Showing {filtered.length} / {matches.length}</div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[520px] overflow-auto pr-1">
        {filtered.map((m) => (
          <div key={m.id} className="rounded-2xl border border-white/10 bg-[#0b0c12]/80 p-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-white/60">{m.id} • Week {m.week}</div>
              <div className="text-xs text-[#d6b56b]/70">Map poll</div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white/90">{m.teamA}</div>
              <div className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white/90">{m.teamB}</div>
            </div>
            <div className="mt-2 text-xs text-white/50">{m.note}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-white/50">
        Admin note: these are placeholder slots. Once teams are finalized, we can auto-generate or import the real matchups.
      </div>
    </div>
  );
}
