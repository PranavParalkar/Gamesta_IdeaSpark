"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from './ui/Button';
import { ThemeToggle } from './ui/ThemeToggle';

function getToken() {
  return typeof window !== 'undefined' ? sessionStorage.getItem('gamesta_token') : null;
}

export default function Header() {
  const [token, setToken] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    setToken(getToken());
  }, []);

  function signOut() {
    sessionStorage.removeItem('gamesta_token');
    setToken(null);
  }

  return (
    <header className="sticky top-3 z-50 w-full sm:w-11/12 md:w-1/2 mx-auto border-b border-border rounded-full bg-gradient-to-l from-purple-300 to-pink-200 backdrop-blur px-3 sm:px-0">
      <div className="container mx-auto px-4">
        {/* Grid with 3 columns: left=logo, center=nav (centered), right=actions */}
        <div className="grid grid-cols-3 items-center h-14">
          {/* Left: Logo (left aligned) */}
          <div className="flex items-center justify-start">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="relative">
                <img
                  src="/logo.png"
                  alt="Gamesta"
                  className="h-8 w-8 sm:h-10 sm:w-10 object-contain rounded-lg shadow-sm border border-border"
                />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-primary rounded-full animate-pulse"></div>
              </div>
              <div className="hidden sm:block text-lg sm:text-xl font-bold">Gamesta</div>
            </Link>
          </div>

          {/* Center: Nav (centered) */}
          <div className="flex items-center justify-center">
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/ideas" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Ideas</Link>
              <Link href="/submit" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Submit</Link>
              <Link href="/leaderboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Leaderboard</Link>
            </nav>
          </div>

          {/* Right: Actions (right aligned) */}
          <div className="flex items-center justify-end space-x-3">
            <ThemeToggle className="hidden sm:inline-flex" />

            {/* Mobile menu button (shown on small screens) */}
            <div className="md:hidden">
              <button
                aria-label="Open menu"
                onClick={() => setMenuOpen(!menuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md border border-border bg-background/80 backdrop-blur hover:opacity-90"
              >
                {menuOpen ? (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>

            {/* Avatar for md+ screens */}
            {token ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen((s) => !s)}
                  aria-label="Open user menu"
                  className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-border bg-background hover:opacity-90"
                >
                  <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.597 6.879 1.646M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-background border border-border rounded-md shadow-md z-50 p-2">
                    <Link href="/profile" className="block px-3 py-2 text-sm text-foreground hover:bg-muted rounded" onClick={() => setUserMenuOpen(false)}>Profile</Link>
                    <button
                      className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-muted rounded"
                      onClick={() => { setUserMenuOpen(false); signOut(); }}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:block">
                <Link href="/login">
                  <Button size="sm">Sign in</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="md:hidden mt-2 px-4 pb-4">
          <div className="flex flex-col space-y-2 bg-background rounded-lg p-3 border border-border shadow-sm">
            <Link href="/ideas" className="text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setMenuOpen(false)}>Ideas</Link>
            <Link href="/submit" className="text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setMenuOpen(false)}>Submit</Link>
            <Link href="/leaderboard" className="text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setMenuOpen(false)}>Leaderboard</Link>
            <div className="pt-2 border-t border-border mt-2">
              {token ? (
                <div className="flex flex-col">
                  <Link href="/profile" className="px-3 py-2 text-sm text-foreground hover:bg-muted rounded" onClick={() => setMenuOpen(false)}>Profile</Link>
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-muted rounded"
                    onClick={() => { signOut(); setMenuOpen(false); }}
                  >
                    Sign out
                  </button>
                </div>
                ) : (
                <Link href="/login" className="px-3 py-2 text-sm text-foreground hover:bg-muted rounded" onClick={() => setMenuOpen(false)}>Sign in</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}