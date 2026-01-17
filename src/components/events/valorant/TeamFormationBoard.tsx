"use client";

import React, { useEffect, useMemo, useState } from "react";

type Role = "Sentinel" | "Controller" | "Duelist" | "Initiator";

type TeamFormationPost = {
  id: number;
  createdAt: string;
  kind: "player" | "team";
  roles: Role[];
  description: string;
  contact: string | null;
};

const ROLE_COLORS: Record<Role, string> = {
  Sentinel: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  Controller: "border-sky-500/30 bg-sky-500/10 text-sky-200",
  Duelist: "border-rose-500/30 bg-rose-500/10 text-rose-200",
  Initiator: "border-amber-500/30 bg-amber-500/10 text-amber-200",
};

function timeAgo(iso: string) {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function getToken() {
  try {
    return typeof window !== "undefined" ? sessionStorage.getItem("gamesta_token") : null;
  } catch {
    return null;
  }
}

export default function TeamFormationBoard() {
  const [posts, setPosts] = useState<TeamFormationPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [kind, setKind] = useState<"player" | "team">("player");
  const [roles, setRoles] = useState<Role[]>(["Duelist"]);
  const [contact, setContact] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const [filterKind, setFilterKind] = useState<"all" | "player" | "team">("all");
  const [filterRole, setFilterRole] = useState<Role | "all">("all");

  const token = getToken();

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/events/valorant/team-formation", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Failed to load");
      setPosts(Array.isArray(json?.data) ? json.data : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (filterKind !== "all" && p.kind !== filterKind) return false;
      if (filterRole !== "all" && !p.roles.includes(filterRole)) return false;
      return true;
    });
  }, [posts, filterKind, filterRole]);

  const toggleRole = (r: Role) => {
    setRoles((prev) => {
      const has = prev.includes(r);
      const next = has ? prev.filter((x) => x !== r) : [...prev, r];
      return next.length === 0 ? prev : next;
    });
  };

  const createPost = async () => {
    if (!token) {
      setError("Please sign in to create a post.");
      return;
    }
    if (busy) return;

    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/events/valorant/team-formation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          kind,
          roles,
          description,
          contact: contact.trim() || undefined,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Failed to create");

      setDescription("");
      setContact("");
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to create");
    } finally {
      setBusy(false);
    }
  };

  const copyContact = async (p: TeamFormationPost) => {
    if (!token) {
      setError("Sign in to view and copy contact details.");
      return;
    }

    if (!p.contact) {
      setError("No contact info available for this post.");
      return;
    }

    try {
      await navigator.clipboard.writeText(p.contact);
    } catch {
      // ignore clipboard errors
    }
  };

  const RoleChip = ({ r, selected }: { r: Role; selected: boolean }) => (
    <button
      type="button"
      onClick={() => toggleRole(r)}
      className={`px-3 py-1.5 rounded-full border text-xs transition-colors ${
        selected ? ROLE_COLORS[r] : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
      }`}
    >
      {r}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
        <div className="text-sm uppercase tracking-[0.25em] text-white/60">Phase 1 — Team Formation (14-Jan to 31 Jan)</div>
        <div className="mt-2 text-sm text-white/70">
          <div className="text-white/80">Team formation happens on Discord:</div>
          <ol className="mt-2 space-y-1.5 list-decimal list-inside">
            <li>Open the Gamesta Discord server.</li>
            <li>Go to the <span className="text-white">Valorant</span> section → <span className="text-white">#lfm</span>.</li>
            <li>Post what you need: role(s), rank (optional), availability, and contact.</li>
            <li>Join <span className="text-white">Join to Create Valo VC</span> to spin up a voice channel and try out a stack.</li>
            <li>Once your 5 is final, register your team from <span className="text-white">1 Feb</span> onwards.</li>
          </ol>
          <div className="mt-2 text-white/60">
            Roles: Sentinel, Controller, Duelist, Initiator.
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold">Create a requirement</div>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setKind("player")}
                className={`px-3 py-2 rounded-xl text-sm border transition-colors ${
                  kind === "player" ? "border-[#d6b56b]/30 bg-[#d6b56b]/10 text-white" : "border-white/10 bg-black/30 text-white/70"
                }`}
              >
                I&apos;m a player
              </button>
              <button
                type="button"
                onClick={() => setKind("team")}
                className={`px-3 py-2 rounded-xl text-sm border transition-colors ${
                  kind === "team" ? "border-[#d6b56b]/30 bg-[#d6b56b]/10 text-white" : "border-white/10 bg-black/30 text-white/70"
                }`}
              >
                I&apos;m a team
              </button>
            </div>

            <div className="mt-4">
              <div className="text-xs text-white/60">Roles</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(Object.keys(ROLE_COLORS) as Role[]).map((r) => (
                  <RoleChip key={r} r={r} selected={roles.includes(r)} />
                ))}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs text-white/60">Contact (Discord/WhatsApp/Instagram)</div>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="e.g. discord: yourname#1234"
                className="mt-2 w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#d6b56b]/25"
              />
              <div className="mt-1 text-[11px] text-white/50">Visible only to signed-in users.</div>
            </div>

            <div className="mt-4">
              <div className="text-xs text-white/60">Requirement</div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder={kind === "player" ? "Your role(s), availability, rank (optional), what kind of team you want..." : "What roles you need, match timings, rank requirements..."}
                className="mt-2 w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#d6b56b]/25"
              />
            </div>

            <button
              type="button"
              onClick={createPost}
              disabled={busy || description.trim().length < 10}
              className="mt-4 w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6d28d9] via-[#a855f7] to-[#06b6d4] text-sm font-semibold disabled:opacity-60"
            >
              {busy ? "Posting..." : "Post requirement"}
            </button>

            {error && <div className="mt-3 text-sm text-rose-200/90">{error}</div>}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Open requirements</div>
              <button
                type="button"
                onClick={load}
                className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-black/30 hover:bg-black/40 text-white/70"
              >
                Refresh
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFilterKind("all")}
                className={`px-3 py-1.5 rounded-full text-xs border ${filterKind === "all" ? "border-[#d6b56b]/30 bg-[#d6b56b]/10 text-white" : "border-white/10 bg-black/30 text-white/70"}`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterKind("player")}
                className={`px-3 py-1.5 rounded-full text-xs border ${filterKind === "player" ? "border-[#d6b56b]/30 bg-[#d6b56b]/10 text-white" : "border-white/10 bg-black/30 text-white/70"}`}
              >
                Players
              </button>
              <button
                type="button"
                onClick={() => setFilterKind("team")}
                className={`px-3 py-1.5 rounded-full text-xs border ${filterKind === "team" ? "border-[#d6b56b]/30 bg-[#d6b56b]/10 text-white" : "border-white/10 bg-black/30 text-white/70"}`}
              >
                Teams
              </button>

              <div className="w-full" />

              <button
                type="button"
                onClick={() => setFilterRole("all")}
                className={`px-3 py-1.5 rounded-full text-xs border ${filterRole === "all" ? "border-white/10 bg-black/30 text-white" : "border-white/10 bg-black/30 text-white/70"}`}
              >
                Role: All
              </button>
              {(Object.keys(ROLE_COLORS) as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFilterRole(r)}
                  className={`px-3 py-1.5 rounded-full text-xs border ${
                    filterRole === r ? ROLE_COLORS[r] : "border-white/10 bg-black/30 text-white/70"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-3 max-h-[420px] overflow-auto pr-1">
              {loading && <div className="text-sm text-white/60">Loading…</div>}
              {!loading && filtered.length === 0 && (
                <div className="text-sm text-white/60">No posts yet. Be the first to post a requirement.</div>
              )}

              {filtered.map((p) => (
                <div key={p.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.25em] text-white/50">
                        {p.kind === "team" ? "Team needs players" : "Player looking for team"}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {p.roles.map((r) => (
                          <span key={r} className={`px-2 py-1 rounded-full border text-[11px] ${ROLE_COLORS[r]}`}>
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-white/50">{timeAgo(p.createdAt)}</div>
                  </div>

                  <div className="mt-3 text-sm text-white/75 whitespace-pre-wrap">{p.description}</div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => copyContact(p)}
                      className="px-3 py-2 rounded-xl text-sm border border-[#d6b56b]/25 bg-[#d6b56b]/10 hover:bg-[#d6b56b]/15 text-white"
                    >
                      Copy contact
                    </button>
                    <button
                      type="button"
                      onClick={() => load()}
                      className="px-3 py-2 rounded-xl text-sm border border-white/10 bg-white/5 hover:bg-white/10 text-white/80"
                    >
                      Update
                    </button>
                  </div>

                  {!token && <div className="mt-2 text-xs text-white/50">Sign in to view/copy contact details.</div>}
                  {token && !p.contact && <div className="mt-2 text-xs text-white/50">No contact provided.</div>}
                  {token && p.contact && <div className="mt-2 text-xs text-white/60">Contact will be copied to clipboard.</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-white/50">
        Tip: Use <span className="text-white">#lfm</span> for posts and <span className="text-white">Join to Create Valo VC</span> for quick tryouts.
      </div>
    </div>
  );
}
