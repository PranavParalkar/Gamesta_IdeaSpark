"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User } from "lucide-react";

function getToken() {
  return typeof window !== "undefined" ? sessionStorage.getItem("gamesta_token") : null;
}

export default function Header() {
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    setToken(getToken());
  }, []);

  function signOut() {
    sessionStorage.removeItem("gamesta_token");
    setToken(null);
  }

  // Define nav items
  const navItems = [
    { name: "Voting", href: "/ideas" },
    { name: "Idea", href: "/submit" },
    { name: "Leaderboard", href: "/leaderboard" },
  ];

  return (
    <header className="sticky top-3 z-50 w-full backdrop-blur-lg rounded-2xl shadow-md mx-auto">
      <div className="flex justify-between items-center px-4 py-2 sm:px-6 md:px-10">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 hover:opacity-90 transition">
          <div className="relative">
            <img src="/logo.png" alt="Gamesta" className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg border border-white/20" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-ping" />
          </div>
          <span className="hidden sm:block text-xl font-semibold text-white">Gamesta</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-4 bg-gradient-to-l from-pink-400 to-purple-700 px-4 py-2 rounded-full font-medium text-sm text-gray-200">
          {navItems.map(({ name, href }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-4 py-2 rounded-full transition-all ${
                  isActive
                    ? "bg-white/20 text-white shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                    : "hover:bg-white/10 hover:text-white"
                }`}
              >
                {name}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-full bg-white/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {/* Auth Buttons */}
          {token ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((p) => !p)}
                className="h-9 w-9 flex items-center justify-center rounded-full border border-white/20 bg-white/10 hover:bg-white/20 transition"
              >
                <User size={18} className="text-white" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-40 bg-black/80 text-white border border-white/10 rounded-lg p-2 shadow-lg"
                  >
                    <Link
                      href="/profile"
                      className="block px-3 py-2 text-sm hover:bg-white/10 rounded"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/10 rounded"
                    >
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link href="/login">
              <button className="text-sm font-medium text-black bg-gradient-to-r from-pink-400 to-purple-400 px-4 py-2 rounded-full hover:opacity-90 transition">
                Sign In
              </button>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="md:hidden flex items-center justify-center h-9 w-9 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 transition"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-black/70 border-t border-white/10 rounded-b-2xl px-6 py-4 space-y-3 text-gray-200"
          >
            {navItems.map(({ name, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg transition ${
                  pathname === href
                    ? "bg-white/10 text-pink-400"
                    : "hover:bg-white/10 hover:text-pink-400"
                }`}
              >
                {name}
              </Link>
            ))}

            <div className="border-t border-white/10 pt-3">
              {token ? (
                <>
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="block hover:text-pink-400 transition">Profile</Link>
                  <button
                    onClick={() => {
                      signOut();
                      setMenuOpen(false);
                    }}
                    className="text-left w-full text-red-400 hover:text-pink-400 transition"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setMenuOpen(false)} className="block text-white bg-gradient-to-r from-pink-400 to-purple-400 mt-2 px-4 py-2 rounded-full text-center font-medium">
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}