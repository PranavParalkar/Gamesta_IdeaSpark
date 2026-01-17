"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import PrismaticBurst from "@/components/ui/PrismaticBurst";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Sparkline from "@/components/ui/Sparkline";
import {
  Users,
  Lightbulb,
  Calendar,
  ClipboardList,
  LayoutDashboard,
  Trash2,
  Download,
  RefreshCcw,
  AlertTriangle,
  ArrowLeft,
  Search,
  Menu,
  Plus,
} from "lucide-react";

type User = { id: number; name: string; email: string; role: string; createdAt?: string };
type Idea = {
  id: number;
  title: string;
  description?: string;
  score?: number;
  upvoteCount?: number;
  createdAt?: string;
  userId?: number;
  userName?: string;
  userEmail?: string;
};
type EventItem = {
  id: number;
  name: string;
  price: number;
  ticketLimit?: number | null;
  createdAt?: string;
  active?: boolean;
};
type Registration = {
  id: number;
  eventName: string;
  userId?: number;
  createdAt?: string;
  orderId?: string | null;
  paymentId?: string | null;
  price?: number | null;
  user?: { email?: string; name?: string };
};

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "users", label: "Users", icon: Users },
  { key: "ideas", label: "Ideas", icon: Lightbulb },
  { key: "events", label: "Events", icon: Calendar },
  { key: "regs", label: "Registrations", icon: ClipboardList },
] as const;

type TabKey = (typeof TABS)[number]["key"];

type ProfileResponse = {
  user?: {
    isAdmin?: boolean;
    role?: string;
  };
};

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<string>("USER");
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [token, setToken] = useState<string | null>(null);
  const [tokenReady, setTokenReady] = useState(false);

  // Data
  const [users, setUsers] = useState<User[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  // Queries
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    try {
      setToken(sessionStorage.getItem("gamesta_token"));
    } catch {
      setToken(null);
    }
    setTokenReady(true);
  }, []);

  const handleBack = () => {
    try {
      router.back();
      setTimeout(() => {
        // If there is no history entry, router.back() won't navigate.
        if (typeof window !== "undefined" && window.location.pathname === "/admin") {
          window.location.href = "/";
        }
      }, 150);
    } catch {
      window.location.href = "/";
    }
  };

  const readJsonSafe = async (res: Response) => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  const fetchAllData = async () => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [uRes, iRes, eRes, rRes] = await Promise.all([
        fetch("/api/admin/users", { headers }),
        fetch("/api/admin/ideas", { headers }),
        fetch("/api/admin/events", { headers }),
        fetch("/api/admin/registrations", { headers }),
      ]);

      const [uJ, iJ, eJ, rJ] = await Promise.all([
        readJsonSafe(uRes),
        readJsonSafe(iRes),
        readJsonSafe(eRes),
        readJsonSafe(rRes),
      ]);

      if (!uRes.ok) toast.error(uJ?.error || "Failed to load users");
      if (!iRes.ok) toast.error(iJ?.error || "Failed to load ideas");
      if (!eRes.ok) toast.error(eJ?.error || "Failed to load events");
      if (!rRes.ok) toast.error(rJ?.error || "Failed to load registrations");

      setUsers((uRes.ok && uJ?.data) || []);
      setIdeas((iRes.ok && iJ?.data) || []);
      setEvents((eRes.ok && eJ?.data) || []);
      setRegistrations((rRes.ok && rJ?.data) || []);
    } catch (e) {
      console.error("Partial data load failure", e);
      toast.error("Some data failed to refresh.");
    }
  };

  // Initial Load
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!tokenReady) return;
      if (!token) {
        window.location.href = "/login";
        return;
      }
      try {
        const profRes = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!profRes.ok) throw new Error("Failed to fetch profile");
        const prof = (await profRes.json()) as ProfileResponse;

        if (!prof.user?.isAdmin) {
          toast.error("Access Denied: Admin privileges required.");
          setTimeout(() => (window.location.href = "/"), 1000);
          return;
        }

        if (mounted) {
          setIsAdmin(true);
          setRole(prof.user.role || "USER");
        }

        await fetchAllData();
      } catch (e) {
        console.error(e);
        toast.error("Failed to load admin dashboard.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, tokenReady]);

  const handleRefresh = async () => {
    const t = toast.loading("Refreshing data...");
    await fetchAllData();
    toast.success("Updated", { id: t });
  };

  // Add User Logic
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"USER" | "ADMIN" | "SUPER_ADMIN">("USER");
  const [newUserPassword, setNewUserPassword] = useState("");

  const handleCreateUser = async () => {
    if (!newUserEmail || !newUserPassword) return toast.error("Email and Password required");
    const t = toast.loading("Creating user...");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          role: newUserRole,
          password: newUserPassword,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed");
      setUsers((p) => [json.data, ...p]);
      toast.success("User created", { id: t });
      setIsAddUserOpen(false);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserRole("USER");
      setNewUserPassword("");
    } catch (e: any) {
      toast.error(e?.message || "Failed to create user", { id: t });
    }
  };

  // Add Idea Logic
  const [isAddIdeaOpen, setIsAddIdeaOpen] = useState(false);
  const [newIdeaTitle, setNewIdeaTitle] = useState("");
  const [newIdeaDesc, setNewIdeaDesc] = useState("");
  const [newIdeaUserId, setNewIdeaUserId] = useState<string>("");

  const handleCreateIdea = async () => {
    if (!newIdeaTitle || !newIdeaUserId) return toast.error("Title and Author required");
    const t = toast.loading("Creating idea...");
    try {
      const res = await fetch("/api/admin/ideas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newIdeaTitle, description: newIdeaDesc, userId: Number(newIdeaUserId) }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed");
      setIdeas((p) => [json.data, ...p]);
      toast.success("Idea created", { id: t });
      setIsAddIdeaOpen(false);
      setNewIdeaTitle("");
      setNewIdeaDesc("");
      setNewIdeaUserId("");
    } catch (e: any) {
      toast.error(e?.message || "Failed to create idea", { id: t });
    }
  };

  // Add Registration Logic
  const [isAddRegOpen, setIsAddRegOpen] = useState(false);
  const [newRegEventName, setNewRegEventName] = useState<string>("");
  const [newRegUserId, setNewRegUserId] = useState<string>("");
  const [newRegPrice, setNewRegPrice] = useState<string>("");
  const [newRegOrderId, setNewRegOrderId] = useState<string>("");
  const [newRegPaymentId, setNewRegPaymentId] = useState<string>("");

  const handleCreateRegistration = async () => {
    if (!newRegEventName.trim()) return toast.error("Event name required");
    const t = toast.loading("Creating registration...");
    try {
      const res = await fetch("/api/admin/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventName: newRegEventName.trim(),
          userId: newRegUserId.trim() ? Number(newRegUserId) : null,
          price: newRegPrice.trim() ? Number(newRegPrice) : null,
          orderId: newRegOrderId.trim() || null,
          paymentId: newRegPaymentId.trim() || null,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed");
      setRegistrations((p) => [json.data, ...p]);
      toast.success("Registration created", { id: t });
      setIsAddRegOpen(false);
      setNewRegEventName("");
      setNewRegUserId("");
      setNewRegPrice("");
      setNewRegOrderId("");
      setNewRegPaymentId("");
    } catch (e: any) {
      toast.error(e?.message || "Failed to create registration", { id: t });
    }
  };

  // Add Event Logic
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEventName, setNewEventName] = useState("");
  const [newEventPrice, setNewEventPrice] = useState("");
  const [newEventLimit, setNewEventLimit] = useState("");

  const handleCreateEvent = async () => {
    if (!newEventName || !newEventPrice) return toast.error("Name and Price required");
    const t = toast.loading("Creating event...");
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
            body: JSON.stringify({ name: newEventName, price: newEventPrice, ticketLimit: newEventLimit || null })
      });

      if (!res.ok) throw new Error("Failed");
      const json = await res.json();

      setEvents((p) => [...p, json.data]);
      toast.success("Event created", { id: t });
      setIsAddEventOpen(false);
      setNewEventName("");
      setNewEventPrice("");
      setNewEventLimit("");
    } catch {
      toast.error("Failed to create event", { id: t });
    }
  };

  const handleDelete = async (type: "users" | "ideas" | "events" | "registrations", id: number) => {
    if (!confirm("Are you sure? This action is irreversible.")) return;

    const t = toast.loading("Deleting...");
    try {
      const res = await fetch(`/api/admin/${type}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      toast.success("Deleted successfully", { id: t });

      if (type === "users") setUsers((p) => p.filter((x) => x.id !== id));
      if (type === "ideas") setIdeas((p) => p.filter((x) => x.id !== id));
      if (type === "events") setEvents((p) => p.filter((x) => x.id !== id));
      if (type === "registrations") setRegistrations((p) => p.filter((x) => x.id !== id));
    } catch {
      toast.error("Failed to delete item", { id: t });
    }
  };

  const handleDiagnostics = async () => {
    const t = toast.loading("Checking DB connection...");
    try {
      const res = await fetch("/api/admin/diagnostics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await readJsonSafe(res);
      if (!res.ok) throw new Error(j?.error || "Diagnostics failed");

      toast.success(
        `DB: ${j?.database || "?"} | Host: ${j?.dbHost || "?"} | Users: ${j?.counts?.users ?? "?"} | Ideas: ${j?.counts?.ideas ?? "?"}`,
        { id: t },
      );
    } catch (e: any) {
      toast.error(e?.message || "Diagnostics failed", { id: t });
    }
  };

  const downloadCSV = (filename: string, data: any[]) => {
    if (!data.length) return toast("No data to export");
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((fieldName) => JSON.stringify(row[fieldName], (_, v) => v ?? ""))
          .join(","),
      ),
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    switch (activeTab) {
      case "users":
        return users.filter(
          (u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q),
        );
      case "ideas":
        return ideas.filter((i) =>
          i.title?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q) ||
          i.userEmail?.toLowerCase().includes(q) ||
          i.userName?.toLowerCase().includes(q)
        );
      case "events":
        return events.filter((e) => e.name?.toLowerCase().includes(q));
      case "regs":
        return registrations.filter(
          (r) => r.eventName?.toLowerCase().includes(q) || r.user?.email?.toLowerCase().includes(q),
        );
      default:
        return [];
    }
  }, [activeTab, searchQuery, users, ideas, events, registrations]);

  const stats = useMemo(() => {
    const dateGroups: Record<string, number> = {};
    registrations.forEach((r) => {
      const d = r.createdAt ? r.createdAt.split("T")[0] : "Unknown";
      dateGroups[d] = (dateGroups[d] || 0) + 1;
    });
    const dates = Object.keys(dateGroups).sort();
    const trendData = dates.slice(-14).map((d) => dateGroups[d]);
    const regTrend = trendData.length > 2 ? trendData : [0, 0, 1, 3, 2, 5, 4];

    return {
      userCount: users.length,
      ideaCount: ideas.length,
      eventCount: events.length,
      regCount: registrations.length,
      regTrend,
    };
  }, [users, ideas, events, registrations]);

  if (loading) return <LoadingScreen />;
  if (!isAdmin) return <AccessDenied />;

  const NavContent = () => (
    <div>
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          Gamesta
        </h1>
        <p className="text-xs text-white/40 mt-1 uppercase tracking-wider">Admin Console</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
              ${
                activeTab === tab.key
                  ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/5"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">
            {role.substring(0, 2)}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-sm font-medium truncate">{role}</div>
            <div className="text-xs text-white/40">Active Session</div>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start text-red-400 hover:text-red-300 border-red-900/30 hover:bg-red-900/20"
          onClick={() => (window.location.href = "/")}
        >
          Exit Dashboard
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex overflow-hidden font-sans selection:bg-purple-500/30">
      {/* Background Visuals */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <PrismaticBurst intensity={0.4} speed={0.2} colors={["#4c1d95", "#be185d", "#0f766e"]} />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
      </div>

      {/* Sidebar (Desktop) */}
      <aside className="w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl z-20 hidden md:flex flex-col">
        <NavContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-40 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -250 }}
              animate={{ x: 0 }}
              exit={{ x: -250 }}
              className="fixed inset-y-0 left-0 w-64 bg-[#111] border-r border-white/10 z-50 md:hidden flex flex-col"
            >
              <NavContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-white/10 bg-black/20 backdrop-blur-md flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-white/70 hover:bg-white/10 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleBack}
              className="h-9 px-3 rounded-full hover:bg-white/10 text-white/80"
              title="Back"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
            <div className="md:hidden font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Gamesta
            </div>
          </div>

          <div className="flex items-center gap-4 flex-1 justify-end">
            {activeTab !== "overview" && (
              <div className="relative w-full max-w-sm hidden sm:block">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                  size={16}
                />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeTab}...`}
                  className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-white/20"
                />
              </div>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              className="h-9 w-9 p-0 rounded-full hover:bg-white/10"
              title="Refresh Data"
            >
              <RefreshCcw size={16} />
            </Button>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "overview" && (
                  <OverviewTab stats={stats} registrations={registrations} ideas={ideas} users={users} />
                )}
                {activeTab === "users" && (
                  <DataTable
                    columns={["ID", "Name", "Email", "Role", "Created", "Actions"]}
                    data={filteredData}
                    renderRow={(u: User) => (
                      <>
                        <td className="p-4 text-white/50 w-16">#{u.id}</td>
                        <td className="p-4 font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px]">
                              {u.name?.charAt(0)}
                            </div>
                            {u.name}
                          </div>
                        </td>
                        <td className="p-4 text-white/70">{u.email}</td>
                        <td className="p-4">
                          <Badge>{u.role}</Badge>
                        </td>
                        <td className="p-4 text-white/40 text-xs">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                        </td>
                        <td className="p-4 text-right">
                          <ActionButtons onDelete={() => handleDelete("users", u.id)} />
                        </td>
                      </>
                    )}
                    onExport={() => downloadCSV("users.csv", users)}
                    headerActions={
                      <Button
                        size="sm"
                        onClick={() => setIsAddUserOpen(true)}
                        className="gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs  h-8 border-0"
                      >
                        <Plus size={14} /> Add User
                      </Button>
                    }
                  />
                )}
                {activeTab === "ideas" && (
                  <DataTable
                    columns={["ID", "Title", "Score", "Upvotes", "Author", "Created", "Actions"]}
                    data={filteredData}
                    renderRow={(i: Idea) => (
                      <>
                        <td className="p-4 text-white/50 w-16">#{i.id}</td>
                        <td className="p-4 font-medium max-w-xs truncate" title={i.title}>
                          {i.title}
                        </td>
                        <td className="p-4 text-purple-300 font-bold">{i.score || 0}</td>
                        <td className="p-4 text-white/70">{i.upvoteCount || 0}</td>
                        <td className="p-4 text-white/70">
                          <div className="flex flex-col">
                            <span className="text-sm">{i.userName || "Unknown"}</span>
                            <span className="text-[10px] text-white/30">{i.userEmail}</span>
                          </div>
                        </td>
                        <td className="p-4 text-white/40 text-xs">{i.createdAt ? new Date(i.createdAt).toLocaleDateString() : "-"}</td>
                        <td className="p-4 text-right">
                          <ActionButtons onDelete={() => handleDelete("ideas", i.id)} />
                        </td>
                      </>
                    )}
                    onExport={() => downloadCSV("ideas.csv", ideas)}
                    headerActions={
                      <Button
                        size="sm"
                        onClick={() => setIsAddIdeaOpen(true)}
                        className="gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs  h-8 border-0"
                      >
                        <Plus size={14} /> Add Idea
                      </Button>
                    }
                  />
                )}
                {activeTab === "events" && (
                  <DataTable
                    columns={["ID", "Name", "Price", "Ticket Limit", "Active", "Created", "Actions"]}
                    data={filteredData}
                    headerActions={
                      <Button
                        size="sm"
                        onClick={() => setIsAddEventOpen(true)}
                        className="gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs  h-8 border-0"
                      >
                        <Plus size={14} /> Add Event
                      </Button>
                    }
                    renderRow={(e: EventItem) => (
                      <>
                        <td className="p-4 text-white/50 w-16">#{e.id}</td>
                        <td className="p-4 font-medium">{e.name}</td>
                        <td className="p-4 font-mono text-green-400">₹{e.price}</td>
                        <td className="p-4 text-white/70">{e.ticketLimit ?? "-"}</td>
                        <td className="p-4">
                          <Badge>{e.active ? "ACTIVE" : "INACTIVE"}</Badge>
                        </td>
                        <td className="p-4 text-white/40 text-xs">
                          {e.createdAt ? new Date(e.createdAt).toLocaleDateString() : "-"}
                        </td>
                        <td className="p-4 text-right">
                          <ActionButtons onDelete={() => handleDelete("events", e.id)} />
                        </td>
                      </>
                    )}
                    onExport={() => downloadCSV("events.csv", events)}
                  />
                )}
                {activeTab === "regs" && (
                  <DataTable
                    columns={["ID", "Event", "User", "Date", "Actions"]}
                    data={filteredData}
                    renderRow={(r: Registration) => (
                      <>
                        <td className="p-4 text-white/50 w-16">#{r.id}</td>
                        <td className="p-4 font-medium">{r.eventName}</td>
                        <td className="p-4 text-white/70">
                          <div className="flex flex-col">
                            <span className="text-sm">{r.user?.name || "Unknown"}</span>
                            <span className="text-[10px] text-white/30">{r.user?.email}</span>
                          </div>
                        </td>
                        <td className="p-4 text-white/50 text-sm font-mono">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "-"}
                        </td>
                        <td className="p-4 text-right">
                          <ActionButtons onDelete={() => handleDelete("registrations", r.id)} />
                        </td>
                      </>
                    )}
                    onExport={() => downloadCSV("registrations.csv", registrations)}
                    headerActions={
                      <Button
                        size="sm"
                        onClick={() => setIsAddRegOpen(true)}
                        className="gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs  h-8 border-0"
                      >
                        <Plus size={14} /> Add Registration
                      </Button>
                    }
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {activeTab === "overview" && role === "SUPER_ADMIN" && (
              <div className="mt-12 pt-8 border-t border-white/10">
                <div className="mb-4 flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div>
                    <div className="font-medium text-white/90">DB Diagnostics</div>
                    <div className="text-sm text-white/50">Shows connected database and row counts.</div>
                  </div>
                  <Button
                    onClick={handleDiagnostics}
                    className="bg-white/10 hover:bg-white/15 text-white border border-white/10"
                  >
                    Check Connection
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Event Modal */}
      <AnimatePresence>
        {isAddEventOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsAddEventOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl z-10"
            >
              <h3 className="text-xl font-bold mb-4">Add New Event</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Event Name</label>
                  <input
                    value={newEventName}
                    onChange={(e) => setNewEventName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="e.g. Counter Strike 2"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Price (₹)</label>
                  <input
                    value={newEventPrice}
                    onChange={(e) => setNewEventPrice(e.target.value)}
                    type="number"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="e.g. 500"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Ticket Limit (optional)</label>
                  <input
                    value={newEventLimit}
                    onChange={e => setNewEventLimit(e.target.value)}
                    type="number"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="e.g. 128"
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setIsAddEventOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateEvent} className="bg-purple-600 hover:bg-purple-700 text-white">
                  Create Event
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add User Modal */}
      <AnimatePresence>
        {isAddUserOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsAddUserOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl z-10"
            >
              <h3 className="text-xl font-bold mb-4">Add New User</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Name</label>
                  <input
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="e.g. Alex"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Email</label>
                  <input
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    type="email"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="e.g. alex@example.com"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Password</label>
                  <input
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    type="password"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="min 6 characters"
                  />
                </div>
              </div>
              <div className="mt-8 flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setIsAddUserOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateUser} className="bg-purple-600 hover:bg-purple-700 text-white">
                  Create User
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Idea Modal */}
      <AnimatePresence>
        {isAddIdeaOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsAddIdeaOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl z-10"
            >
              <h3 className="text-xl font-bold mb-4">Add New Idea</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Title</label>
                  <input
                    value={newIdeaTitle}
                    onChange={(e) => setNewIdeaTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="e.g. LAN Tournament Night"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Author</label>
                  <select
                    value={newIdeaUserId}
                    onChange={(e) => setNewIdeaUserId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="">Select a user</option>
                    {users.map((u) => (
                      <option key={u.id} value={String(u.id)}>
                        #{u.id} {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Description (optional)</label>
                  <textarea
                    value={newIdeaDesc}
                    onChange={(e) => setNewIdeaDesc(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors min-h-[90px]"
                    placeholder="Short description"
                  />
                </div>
              </div>
              <div className="mt-8 flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setIsAddIdeaOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateIdea} className="bg-purple-600 hover:bg-purple-700 text-white">
                  Create Idea
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Registration Modal */}
      <AnimatePresence>
        {isAddRegOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsAddRegOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl z-10"
            >
              <h3 className="text-xl font-bold mb-4">Add Registration</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Event Name</label>
                  <input
                    value={newRegEventName}
                    onChange={(e) => setNewRegEventName(e.target.value)}
                    placeholder="e.g. Gamesta Launch"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">User ID (optional)</label>
                  <input
                    value={newRegUserId}
                    onChange={(e) => setNewRegUserId(e.target.value)}
                    placeholder="e.g. 123"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Price (optional)</label>
                    <input
                      value={newRegPrice}
                      onChange={(e) => setNewRegPrice(e.target.value)}
                      placeholder="e.g. 499"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Order ID (optional)</label>
                    <input
                      value={newRegOrderId}
                      onChange={(e) => setNewRegOrderId(e.target.value)}
                      placeholder="e.g. order_ABC"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/50 mb-1 block">Payment ID (optional)</label>
                  <input
                    value={newRegPaymentId}
                    onChange={(e) => setNewRegPaymentId(e.target.value)}
                    placeholder="e.g. pay_ABC"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
              <div className="mt-8 flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setIsAddRegOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRegistration} className="bg-purple-600 hover:bg-purple-700 text-white">
                  Create Registration
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OverviewTab({ stats, registrations, ideas }: any) {
  const topIdeas = useMemo(() => {
    return [...(ideas || [])]
      .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
      .slice(0, 5);
  }, [ideas]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-white/40 text-sm mt-1">Platform performance and statistics</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-1">Total Items</div>
          <div className="text-xl font-mono text-purple-300">
            {(stats.userCount + stats.ideaCount + stats.eventCount + stats.regCount).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4  gap-4">
        <StatCard
          label="Total Users"
          value={stats.userCount}
          icon={Users}
          color="text-blue-400"
          bg="bg-blue-500/10"
          trend={<div className="text-xs text-blue-300/60  mt-2">+12% this week</div>}
        />
        <StatCard
          label="Active Ideas"
          value={stats.ideaCount}
          icon={Lightbulb}
          color="text-yellow-400"
          bg="bg-yellow-500/10"
          trend={<div className="text-xs text-yellow-300/60 mt-2">Active engagement</div>}
        />
        <StatCard
          label="Live Events"
          value={stats.eventCount}
          icon={Calendar}
          color="text-purple-400"
          bg="bg-purple-500/10"
        />
        <Card className="bg-white/5 border-white/10 backdrop-blur-md relative overflow-hidden group">
          <CardContent className="p-6 relative z-10">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-white/50 font-medium group-hover:text-white/70 transition-colors">
                Registrations
              </div>
              <div className="p-2 rounded-xl bg-green-500/10 text-green-400">
                <ClipboardList size={20} />
              </div>
            </div>
            <div className="text-3xl font-bold mb-3">{stats.regCount}</div>

            <div className="h-10 w-full opacity-60 group-hover:opacity-100 transition-opacity translate-y-2">
              <Sparkline
                data={stats.regTrend}
                width={200}
                height={40}
                stroke="#4ade80"
                fill="rgba(74, 222, 128, 0.1)"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white/5 border-white/10 backdrop-blur-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Recent Registrations</h3>
              <Button variant="ghost" size="sm" className="text-xs text-white/40 hover:text-white">
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {registrations.slice(0, 5).map((r: any) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white/40 border border-white/10">
                      <span className="font-bold text-xs">{r.user?.name?.substring(0, 2) || "??"}</span>
                    </div>
                    <div>
                      <div className="font-medium text-sm text-white/90">{r.eventName}</div>
                      <div className="text-xs text-white/40 flex items-center gap-1">
                        <span>{r.user?.email}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "Just now"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="px-2 py-1 rounded text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 font-medium">
                      CONFIRMED
                    </div>
                  </div>
                </div>
              ))}
              {registrations.length === 0 && <div className="text-white/30 text-center py-8">No recent activity</div>}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Trending Ideas</h3>
            <div className="space-y-5">
              {topIdeas.map((i: any, idx: number) => (
                <div key={i.id} className="group cursor-default">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 max-w-[70%]">
                      <div
                        className={`text-xs font-bold w-5 h-5 rounded flex items-center justify-center ${
                          idx < 3 ? "bg-yellow-500/20 text-yellow-400" : "bg-white/10 text-white/40"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <span className="truncate text-sm font-medium group-hover:text-purple-300 transition-colors">
                        {i.title}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-white/80">
                      {i.score} <span className="text-[10px] text-white/30 font-normal">PTS</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: `${Math.min(100, (i.score || 0) * 2)}%` }}
                    />
                  </div>
                </div>
              ))}
              {(ideas?.length ?? 0) === 0 && <div className="text-white/30 text-center py-8">No ideas yet</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DataTable({ columns, data, renderRow, onExport, headerActions }: any) {
  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-md overflow-hidden flex flex-col h-full max-h-[75vh]">
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
        <div className="text-sm text-white/50">
          <strong className="text-white">{data.length}</strong> records found
        </div>
        <div className="flex gap-2">
          {headerActions}
          <Button
            size="sm"
            variant="outline"
            onClick={onExport}
            className="gap-2 bg-white/5 border-white/10 hover:bg-white/10 text-xs h-8"
          >
            <Download size={14} /> Export CSV
          </Button>
        </div>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full text-left text-sm">
          <thead className="bg-black text-white/60 sticky top-0 backdrop-blur-md z-10 border-b border-white/10">
            <tr>
              {columns.map((c: string) => (
                <th key={c} className="p-4 font-medium">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((item: any) => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                {renderRow(item)}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Search size={32} className="text-white/10 mb-3" />
            <div className="text-white/30 italic">No records found matching your filters.</div>
          </div>
        )}
      </div>
    </Card>
  );
}

function StatCard({ label, value, icon: Icon, color, bg, trend }: any) {
  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-white/50 font-medium group-hover:text-white/70 transition-colors">
            {label}
          </div>
          <div className={`p-2 rounded-xl ${bg || "bg-white/5"} ${color}`}>
            <Icon size={20} />
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold tracking-tight text-white mb-1">{value}</div>
          {trend}
        </div>
      </CardContent>
    </Card>
  );
}

function ActionButtons({ onDelete }: any) {
  return (
    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={onDelete}
        title="Delete"
        className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

function Badge({ children }: any) {
  const isUser = children === "USER";
  const isAdmin = children === "ADMIN" || children === "SUPER_ADMIN";
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide border
        ${isUser ? "bg-white/5 text-white/60 border-white/10" : ""}
        ${isAdmin ? "bg-purple-500/10 text-purple-300 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]" : ""}
      `}
    >
      {children}
    </span>
  );
}

function LoadingScreen() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center gap-4 relative">
        <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
        <div className="w-12 h-12 border-2 border-white/10 border-t-purple-500 rounded-full animate-spin relative z-10" />
        <div className="text-sm text-white/50 animate-pulse font-medium tracking-widest uppercase text-[10px]">
          Initializing Core
        </div>
      </div>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-black text-white relative overflow-hidden">
      <PrismaticBurst intensity={0.2} colors={["#ef4444", "#7f1d1d", "#000000"]} />
      <div className="text-center relative z-10 p-8 border border-white/10 rounded-2xl bg-black/50 backdrop-blur-xl">
        <div className="text-5xl mb-6">🚫</div>
        <h1 className="text-3xl font-bold text-red-500 mb-2">Access Denied</h1>
        <p className="text-white/50 mb-8 max-w-xs mx-auto">
          This area is restricted to authorized personnel only.
        </p>
        <Button className="w-full bg-white text-black hover:bg-white/90" onClick={() => (window.location.href = "/")}
        >
          Return Home
        </Button>
      </div>
    </div>
  );
}
