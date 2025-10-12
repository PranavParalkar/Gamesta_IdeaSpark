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

  useEffect(() => {
    setToken(getToken());
  }, []);

  function signOut() {
    sessionStorage.removeItem('gamesta_token');
    setToken(null);
  }

  return (
    <header className="sticky  top-3 z-50 w-1/2 mx-auto  border-b border-border rounded-full  bg-gradient-to-l from-purple-300  to-pink-200 backdrop-blur ">
      <div className="container mx-auto px-4">
        <div className="flex h-12 items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="relative">
                <img 
                  src="/logo.png" 
                  alt="Gamesta" 
                  className="h-10 w-10 object-contain rounded-lg shadow-sm border border-border" 
                />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-primary rounded-full animate-pulse"></div>
              </div>
              <div className="text-xl font-bold ">
                Gamesta
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/ideas" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Ideas
            </Link>
            <Link 
              href="/submit" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Submit
            </Link>
            <Link 
              href="/leaderboard" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Leaderboard
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <ThemeToggle className='' />
            {token ? (
              <Button variant="outline" onClick={signOut} size="sm">
                Sign out
              </Button>
            ) : (
              <Link href="/login">
                <Button size="sm">
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}