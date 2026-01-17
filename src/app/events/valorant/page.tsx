"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PrismaticBurst from "@/components/ui/PrismaticBurst";
import OnlineBrackets from "@/components/events/valorant/OnlineBrackets";

type EventItem = {
  id: number;
  name: string;
  price?: number;
  ticketLimit?: number | null;
  ticketsSold?: number;
  remaining?: number | null;
  createdAt?: string;
  active?: boolean;
};

type BracketMatch = {
  id: string;
  teamA: string;
  teamB: string;
  seedA?: string;
  seedB?: string;
  scoreA?: number | null;
  scoreB?: number | null;
  note?: string;
};

type BracketRound = {
  name: string;
  matches: BracketMatch[];
};

type BracketLink = {
  fromId: string;
  toId: string;
};

const VALORANT_EVENT_NAME = "Valorant Tournament";

const valorantBracket: BracketRound[] = [
  {
    name: "Quarterfinals",
    matches: [
      { id: "QF1", teamA: "TBD", seedA: "Group Seed —", teamB: "TBD", seedB: "Group Seed —" },
      { id: "QF2", teamA: "TBD", seedA: "Group Seed —", teamB: "TBD", seedB: "Group Seed —" },
      { id: "QF3", teamA: "TBD", seedA: "Group Seed —", teamB: "TBD", seedB: "Group Seed —" },
      { id: "QF4", teamA: "TBD", seedA: "Group Seed —", teamB: "TBD", seedB: "Group Seed —" },
    ],
  },
  {
    name: "Semifinals",
    matches: [
      { id: "SF1", teamA: "Winner QF1", teamB: "Winner QF2" },
      { id: "SF2", teamA: "Winner QF3", teamB: "Winner QF4" },
    ],
  },
  {
    name: "Grand Final",
    matches: [{ id: "GF", teamA: "Winner Upper Final", teamB: "TBD" , note: "(Lower bracket not shown)" }],
  },
];

const valorantBracketLinks: BracketLink[] = [
  { fromId: "QF1", toId: "SF1" },
  { fromId: "QF2", toId: "SF1" },
  { fromId: "QF3", toId: "SF2" },
  { fromId: "QF4", toId: "SF2" },
  { fromId: "SF1", toId: "UF" },
  { fromId: "SF2", toId: "UF" },
  { fromId: "UF", toId: "GF" },
];

function BracketView({ rounds, links }: { rounds: BracketRound[]; links: BracketLink[] }) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const matchRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const [paths, setPaths] = React.useState<string[]>([]);

  const setMatchRef = React.useCallback((id: string) => {
    return (el: HTMLDivElement | null) => {
      matchRefs.current[id] = el;
    };
  }, []);

  const recompute = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const cRect = container.getBoundingClientRect();
    const nextPaths: string[] = [];

    for (const l of links) {
      const fromEl = matchRefs.current[l.fromId];
      const toEl = matchRefs.current[l.toId];
      if (!fromEl || !toEl) continue;

      const a = fromEl.getBoundingClientRect();
      const b = toEl.getBoundingClientRect();

      const x1 = a.right - cRect.left;
      const y1 = a.top - cRect.top + a.height / 2;
      const x2 = b.left - cRect.left;
      const y2 = b.top - cRect.top + b.height / 2;

      const dx = Math.max(36, Math.min(120, (x2 - x1) * 0.5));
      // Smooth connector similar to the reference bracket lines.
      nextPaths.push(`M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`);
    }

    setPaths(nextPaths);
  }, [links]);

  React.useEffect(() => {
    recompute();
    const onResize = () => recompute();
    window.addEventListener("resize", onResize);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      ro = new ResizeObserver(() => recompute());
      ro.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      if (ro) ro.disconnect();
    };
  }, [recompute]);

  return (
    <div className="w-full overflow-x-auto">
      <div
        ref={containerRef}
        className="relative min-w-[1200px] grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {/* Connector lines overlay */}
        <svg className="pointer-events-none absolute inset-0" width="100%" height="100%">
          <defs>
            <linearGradient id="bracketGold" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#d6b56b" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#d6b56b" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#d6b56b" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          {paths.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="url(#bracketGold)"
              strokeWidth={2}
              strokeLinecap="round"
            />
          ))}
        </svg>

        {rounds.map((round) => (
          <div
            key={round.name}
            className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-[1px]"
          >
            <div className="rounded-3xl bg-[#090a0f]/80 backdrop-blur-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="text-xs uppercase tracking-[0.38em] text-[#d6b56b]/80">{round.name}</div>
                <div className="mt-1 h-[2px] w-10 rounded-full bg-[#d6b56b]/50" />
              </div>
              <div className="mt-4 space-y-4">
              {round.matches.map((m) => (
                <div
                  key={m.id}
                  ref={setMatchRef(m.id)}
                  className="rounded-2xl border border-white/10 bg-[#0b0c12]/80 p-4 shadow-[0_0_0_1px_rgba(214,181,107,0.10)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-white/60">{m.id}{m.note ? ` • ${m.note}` : ""}</div>
                    <div className="text-xs text-[#d6b56b]/70">
                      {m.scoreA != null && m.scoreB != null ? `${m.scoreA}-${m.scoreB}` : "—"}
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-black/40 border border-white/10 px-3 py-2">
                      <div className="text-[11px] text-white/50">{m.seedA || ""}</div>
                      <div className="text-sm text-white/90">{m.teamA}</div>
                    </div>
                    <div className="rounded-lg bg-black/40 border border-white/10 px-3 py-2">
                      <div className="text-[11px] text-white/50">{m.seedB || ""}</div>
                      <div className="text-sm text-white/90">{m.teamB}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ValorantEventPage() {
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const token = typeof window !== "undefined" ? sessionStorage.getItem("gamesta_token") : null;

  const event = useMemo(() => {
    const byName = events.find((e) => String(e.name).toLowerCase() === VALORANT_EVENT_NAME.toLowerCase());
    if (byName) return byName;
    return events.find((e) => String(e.name).toLowerCase().includes("valorant"));
  }, [events]);

  const eventPrice = Number(event?.price ?? 0);
  const isFree = !Number.isFinite(eventPrice) || eventPrice <= 0;

  const phase1Range = "14-Jan to 31 Jan";
  const phase2Label = "Online Phase";
  const phase3Label = "LAN event";

  const [activePhase, setActivePhase] = useState<"phase1" | "phase2" | "phase3">("phase3");

  const registrationUnlockAt = useMemo(() => {
    // Lock registrations until Feb 1st (local time). Adjust year automatically.
    const now = new Date();
    return new Date(now.getFullYear(), 1, 1, 0, 0, 0);
  }, []);

  const registrationLocked = useMemo(() => {
    if (typeof window === "undefined") return true;
    return new Date() < registrationUnlockAt;
  }, [registrationUnlockAt]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/events");
        const json = await res.json().catch(() => ({}));
        if (res.ok && Array.isArray(json?.data)) setEvents(json.data);
      } catch {
        // ignore
      } finally {
        setLoadingEvent(false);
      }
    })();
  }, []);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const register = async () => {
    if (!event?.name) {
      setStatus("Event info not loaded yet.");
      return;
    }

    if (registrationLocked) {
      setStatus("Team registrations open on Feb 1. Please come back then.");
      return;
    }

    if (!token) {
      setStatus("Please sign in to register.");
      setTimeout(() => router.push("/login"), 400);
      return;
    }

    if (busy) return;

    setBusy(true);
    setStatus(null);

    try {
      // Free event path: skip Razorpay, but still provide payment/order IDs
      if (isFree) {
        const freeOrderId = `free_${Date.now()}`;
        const freePaymentId = `free_${Date.now()}`;

        const regRes = await fetch("/api/profile/events/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            events: [event.name],
            paymentId: freePaymentId,
            orderId: freeOrderId,
          }),
        });

        const regJson = await regRes.json().catch(() => ({}));
        if (!regRes.ok) {
          setStatus(regJson?.error || "Registration failed.");
          return;
        }

        setStatus("Registered successfully.");
        return;
      }

      // Paid path: create order -> Razorpay -> verify -> register
      const createRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ total: eventPrice }),
      });

      const createJson = await createRes.json().catch(() => ({}));
      if (!createRes.ok) {
        setStatus(createJson?.error || "Failed to create payment order.");
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setStatus("Failed to load payment library.");
        return;
      }

      const options: any = {
        key: createJson.key,
        amount: createJson.amount,
        currency: createJson.currency || "INR",
        name: "Gamesta Events",
        description: `Registration: ${event.name}`,
        order_id: createJson.orderId,
        handler: async function (response: any) {
          try {
            const v = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify(response),
            });
            const verified = await v.json().catch(() => ({}));
            if (!v.ok) {
              setStatus(verified?.error || "Payment verification failed.");
              return;
            }

            const regRes = await fetch("/api/profile/events/register", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                events: [event.name],
                paymentId: verified.paymentId || response.razorpay_payment_id,
                orderId: verified.orderId || response.razorpay_order_id,
              }),
            });
            const regJson = await regRes.json().catch(() => ({}));
            if (!regRes.ok) {
              setStatus(regJson?.error || "Payment OK but registration save failed.");
              return;
            }

            setStatus("Payment successful — registration saved.");
          } catch {
            setStatus("Unexpected error while finalizing registration.");
          }
        },
        theme: { color: "#7c3aed" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch {
      setStatus("Unexpected error while starting registration.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen w-full text-white relative overflow-hidden bg-[#07060a]">
      <div className="absolute inset-0 mix-blend-screen opacity-70 z-0 pointer-events-none">
        <PrismaticBurst intensity={0.45} speed={0.4} animationType="rotate3d" colors={["#ff5ec8", "#8f5bff", "#00f6ff"]} />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 pt-24 pb-16">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-white/60">Event</div>
            <h1 className="mt-2 text-3xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-300">
              Valorant Tournament
            </h1>
            <p className="mt-3 text-white/70 max-w-2xl">
              Brackets, format, and registration for the Valorant tournament. The bracket shown below is intended for the LAN stage (Top 8).
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-4 min-w-[280px]">
            <div className="text-sm text-white/70">Registration</div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-xs text-white/60">Price</div>
              <div className="text-sm font-semibold text-white">
                {loadingEvent ? "Loading..." : isFree ? "Free" : `₹${eventPrice}`}
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-xs text-white/60">Remaining</div>
              <div className="text-sm font-semibold text-white">
                {loadingEvent ? "—" : event?.remaining == null ? "—" : String(event.remaining)}
              </div>
            </div>

            <button
              type="button"
              onClick={register}
              disabled={busy || loadingEvent || registrationLocked}
              className="mt-4 w-full inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {busy
                ? "Working..."
                : registrationLocked
                  ? "Registrations open Feb 1"
                  : token
                    ? "Register"
                    : "Sign in to register"}
            </button>

            <div className="mt-2 text-xs text-white/60">
              Team registrations start from <span className="text-white">1 Feb</span> onwards.
            </div>

            <button
              type="button"
              onClick={() => router.push("/events")}
              className="mt-2 w-full px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm"
            >
              Back to Events
            </button>

            {status && (
              <div className="mt-3 text-sm text-white/80 rounded-xl border border-white/10 bg-black/30 p-3">
                {status}
              </div>
            )}
          </div>
        </div>

        <section className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-black/30 backdrop-blur-xl p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="text-lg font-semibold">Tournament Phases</div>
                <p className="mt-1 text-sm text-white/60">
                  Phase 1 is team formation on Discord (#lfm + voice). Phase 2 runs the online knockouts. Phase 3 is the LAN Top 8 bracket.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActivePhase("phase1")}
                  className={`px-4 py-2 rounded-xl text-sm border transition-colors ${
                    activePhase === "phase1" ? "border-[#d6b56b]/30 bg-[#d6b56b]/10 text-white" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  Phase 1
                </button>
                <button
                  type="button"
                  onClick={() => setActivePhase("phase2")}
                  className={`px-4 py-2 rounded-xl text-sm border transition-colors ${
                    activePhase === "phase2" ? "border-[#d6b56b]/30 bg-[#d6b56b]/10 text-white" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  Phase 2
                </button>
                <button
                  type="button"
                  onClick={() => setActivePhase("phase3")}
                  className={`px-4 py-2 rounded-xl text-sm border transition-colors ${
                    activePhase === "phase3" ? "border-[#d6b56b]/30 bg-[#d6b56b]/10 text-white" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  Phase 3
                </button>
              </div>
            </div>

            <div className="mt-6">
              {activePhase === "phase1" && (
                <>
                  <div className="mb-3 text-xs text-white/60">
                    Team Formation window: <span className="text-white">{phase1Range}</span>. Team registrations start from <span className="text-white">1 Feb</span> onwards.
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                    <div className="text-sm uppercase tracking-[0.25em] text-white/60">Phase 1 — Discord Team Formation</div>
                    <div className="mt-3 text-sm text-white/75">
                      <ol className="space-y-2 list-decimal list-inside">
                        <li>
                          Open the Gamesta Discord server and go to the <span className="text-white">Valorant</span> section.
                        </li>
                        <li>
                          Post in <span className="text-white">#lfm</span> (Looking for members): role(s), rank (optional), availability, and your contact.
                        </li>
                        <li>
                          If you see a good post, reply on Discord and coordinate there.
                        </li>
                        <li>
                          Join <span className="text-white">Join to Create Valo VC</span> to spin up a voice channel and try out.
                        </li>
                        <li>
                          Once your 5 is final, register your team here from <span className="text-white">1 Feb</span>.
                        </li>
                      </ol>
                      <div className="mt-3 text-xs text-white/55">Roles: Sentinel, Controller, Duelist, Initiator.</div>
                    </div>
                  </div>
                </>
              )}

              {activePhase === "phase2" && (
                <>
                  <div className="mb-3 text-xs text-white/60">
                    Online Phase runs knockouts and generates a large bracket set (~60 matches). These placeholders can be replaced with real matchups.
                  </div>
                  <OnlineBrackets matchCount={60} />
                </>
              )}

              {activePhase === "phase3" && (
                <>
                  <div className="text-lg font-semibold">Phase 3 — {phase3Label} (Top 8)</div>
                  <p className="mt-2 text-sm text-white/60">
                    Quarterfinals → Semifinals → Finals on campus of MIT Academy of Engineering, Alandi.
                  </p>
                  <div className="mt-5">
                    <BracketView rounds={valorantBracket} links={valorantBracketLinks} />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/30 backdrop-blur-xl p-6 space-y-6">
            <div>
              <div className="text-lg font-semibold">Info</div>
              <div className="mt-2 text-sm text-white/70 space-y-2">
                <div className="flex items-center justify-between"><span className="text-white/60">Mode</span><span>5v5</span></div>
                <div className="flex items-center justify-between"><span className="text-white/60">Online format</span><span>Knockouts (competitive)</span></div>
                <div className="flex items-center justify-between"><span className="text-white/60">Maps</span><span>Single map • map poll</span></div>
                <div className="flex items-center justify-between"><span className="text-white/60">Schedule</span><span>Weekends • ~6 weeks</span></div>
                <div className="flex items-center justify-between"><span className="text-white/60">Online venue</span><span>Rapid Rounds Gaming Cafe</span></div>
                <div className="flex items-center justify-between"><span className="text-white/60">LAN venue</span><span>MIT AOE, Alandi</span></div>
              </div>
            </div>

            <div>
              <div className="text-lg font-semibold">Rules (Starter)</div>
              <ul className="mt-2 text-sm text-white/70 space-y-2 list-disc pl-5">
                <li>Online phase uses randomized brackets with knockout matches.</li>
                <li>Map is finalized via map poll for each match.</li>
                <li>Unsportsmanlike conduct can lead to disqualification.</li>
                <li>Admins/tournament staff decisions are final.</li>
              </ul>
            </div>

            <div>
              <div className="text-lg font-semibold">How registration works</div>
              <p className="mt-2 text-sm text-white/70">
                Register uses your existing Gamesta sign-in token. If the event is paid, it will open Razorpay checkout and then save your registration.
              </p>

              {registrationLocked && (
                <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white/75">
                  <div className="text-xs uppercase tracking-[0.25em] text-[#d6b56b]/80">Registration locked</div>
                  <div className="mt-1">
                    Opens on <span className="text-white">Feb 1</span>.
                    <span className="block mt-1 text-white/60">
                      Unlocks at <span className="text-white">{registrationUnlockAt.toLocaleString()}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
