"use client";
import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../../components/ui/Button';
import PrismaticBurst from '../../components/ui/PrismaticBurst';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const router = useRouter();

  // If we were redirected from OAuth (callbackUrl set to /login?oauth=1),
  // exchange NextAuth session for the app JWT and redirect home.
  useEffect(() => {
    // Use window.location to avoid useSearchParams which causes a pre-render suspense requirement
    try {
      const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
      const oauth = params.get('oauth');
      if (oauth === '1') {
        (async () => {
          try {
            const res = await fetch('/api/auth/oauth-token');
            if (res.ok) {
              const json = await res.json();
              sessionStorage.setItem('gamesta_token', json.token);
              router.push('/');
            } else {
              console.error('Failed to exchange oauth token', await res.text());
            }
          } catch (e) {
            console.error('OAuth exchange error', e);
          }
        })();
      }
    } catch (e) {
      console.error('Error parsing URL params', e);
    }
  }, [router]);

  async function submit(e: any) {
    e.preventDefault();
    setError(null);
    // General email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) return setError('Please enter a valid email address');
    // If registering, require a name
    if (authMode === 'register' && (!name || name.trim().length === 0)) return setError('Please provide your name');
    if (!password || password.length < 6) return setError('Password must be at least 6 characters');

    setLoading(true);
    try {
      const endpoint = authMode === 'login' ? '/api/auth/signin' : '/api/auth/signup';
      const res = await fetch(endpoint, { 
        method: 'POST', 
        body: JSON.stringify({ email, password, name: name || email.split('@')[0] }), 
        headers: { 'Content-Type': 'application/json' } 
      });
      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem('gamesta_token', data.token);
        router.push('/');
      } else {
        const json = await res.json().catch(() => null);
        setError((json && json.error) || 'Failed to sign in');
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to sign in');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      {/* PrismaticBurst background only */}
      <div className="absolute inset-0 z-0">
        <PrismaticBurst
          intensity={1.8}
          speed={0.6}
          animationType="rotate3d"
          colors={["#ff5ec8", "#7a5cff", "#00f6ff"]}
          mixBlendMode="screen"
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="relative">
              <img 
                src="/logo.png" 
                alt="Gamesta" 
                className="h-16 w-16 object-contain rounded-xl shadow-lg" 
              />
            </div>
            <div className="text-3xl font-bold text-white">
              Gamesta
            </div>
          </Link>
          <p className="text-white/80 text-lg">
            Join the community of innovators
          </p>
        </div>

        {/* Login Card */}
        <Card className="backdrop-blur-sm bg-white/95 border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-gray-800">
              {authMode === 'login' ? 'Welcome back' : 'Create account'}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {authMode === 'login' 
                ? 'Sign in to your account to continue' 
                : 'Join thousands of students sharing innovative ideas'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={submit} className="space-y-6">
              <Input
                label="Email"
                type="email"
                placeholder="yourname@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
              />
              {authMode === 'register' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Full name</label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-black placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-md bg-red-50 border border-red-200">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" loading={loading} size="lg">
                {loading ? 'Please wait...' : (authMode === 'login' ? 'Sign in' : 'Create account')}
              </Button>

              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={() => signIn('google', { callbackUrl: '/login?oauth=1' })}
                  className="inline-flex items-center justify-center gap-2 w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {/* Inline Google SVG to avoid missing asset */}
                  <svg className="h-4 w-4" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#4285F4" d="M533.5 278.4c0-18.5-1.6-37.2-4.9-55.1H272.1v104.3h146.9c-6.3 34.1-25.3 62.9-54 82.1v68.2h87.4c51.1-47.1 80.1-116.4 80.1-199.5z"/>
                    <path fill="#34A853" d="M272.1 544.3c73.7 0 135.6-24.5 180.8-66.6l-87.4-68.2c-24.3 16.3-55.4 26-93.4 26-71.7 0-132.5-48.3-154.2-113.1H28.3v70.9C73.2 485 166 544.3 272.1 544.3z"/>
                    <path fill="#FBBC05" d="M117.9 332.4c-10.8-32.1-10.8-66.5 0-98.6V162.9H28.3c-40.4 79.6-40.4 174.2 0 253.8l89.6-84.3z"/>
                    <path fill="#EA4335" d="M272.1 107.7c39.9 0 75.9 13.7 104.1 40.7l78.1-78.1C407.7 22.1 345.8 0 272.1 0 166 0 73.2 59.3 28.3 162.9l89.6 70.9C139.6 156 200.4 107.7 272.1 107.7z"/>
                  </svg>
                  Continue with Google
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <span className="font-medium text-blue-600 hover:text-blue-700">
                    {authMode === 'login' ? 'Sign up' : 'Sign in'}
                  </span>
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link 
            href="/" 
            className="inline-flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to home</span>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="text-white/80">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-xs">Innovative Ideas</p>
          </div>
          <div className="text-white/80">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
            <p className="text-xs">Community Voting</p>
          </div>
          <div className="text-white/80">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-xs">Fast & Easy</p>
          </div>
        </div>
      </div>
    </div>
  );
}