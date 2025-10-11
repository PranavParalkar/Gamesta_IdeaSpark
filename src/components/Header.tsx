"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';

function getToken() {
  return typeof window !== 'undefined' ? sessionStorage.getItem('gamesta_token') : null;
}

export default function Header() {
  const [token, setToken] = useState<string | null>(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    setToken(getToken());
  }, []);

  function signOut() {
    sessionStorage.removeItem('gamesta_token');
    setToken(null);
  }

  return (
    <header className="p-4 border-b flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Link href="/">
          <img src="/logo.jpg" alt="Gamesta" className="h-10 w-10 object-contain rounded" />
        </Link>
        <div className="text-xl font-bold"><Link href="/">Gamesta</Link></div>
      </div>
      <nav className="space-x-4">
        <Link href="/ideas">Ideas</Link>
        <Link href="/submit">Submit</Link>
        <Link href="/leaderboard">Leaderboard</Link>
        {token ? (
          <button onClick={signOut} className="ml-4">Sign out</button>
        ) : (
          <button onClick={() => setShowSignIn(true)} className="ml-4">Sign in</button>
        )}
      </nav>

        {showSignIn && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white p-6 rounded shadow max-w-sm w-full">
              <SignInForm onClose={() => setShowSignIn(false)} mode={authMode} onSwitchMode={(m) => setAuthMode(m)} onSignedIn={() => setToken(getToken())} />
            </div>
          </div>
      )}
    </header>
  );
}

function SignInForm({ onClose, mode = 'login', onSwitchMode, onSignedIn }: { onClose: () => void; mode?: 'login' | 'register'; onSwitchMode?: (m: 'login'|'register') => void; onSignedIn?: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(e: any) {
    e.preventDefault();
    setError(null);
    const gmailRegex = /^[^@\s]+@gmail\.com$/i;
    if (!email || !gmailRegex.test(email)) return setError('Please enter a valid @gmail.com email');
    if (!password || password.length < 6) return setError('Password must be at least 6 characters');

    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/signin' : '/api/auth/signup';
      const res = await fetch(endpoint, { method: 'POST', body: JSON.stringify({ email, password, name: email.split('@')[0] }), headers: { 'Content-Type': 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem('gamesta_token', data.token);
        onSignedIn && onSignedIn();
        onClose();
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
    <form onSubmit={submit} className="space-y-4" aria-labelledby="signin-label">
      <h3 id="signin-label" className="text-lg font-bold">Sign in with Gmail</h3>
      {error && <div role="alert" className="text-red-600">{error}</div>}

      <label className="block text-sm font-medium">Gmail</label>
      <input
        autoFocus
        aria-label="email"
        placeholder="you@gmail.com"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <label className="block text-sm font-medium">Password</label>
      <div className="flex items-center">
        <input
          aria-label="password"
          placeholder="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button type="button" onClick={() => setShowPassword((s) => !s)} className="ml-2 text-sm text-gray-600">
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {mode === 'login' ? (
            <>Don't have an account? <button type="button" onClick={() => onSwitchMode && onSwitchMode('register')} className="text-blue-600">Register</button></>
          ) : (
            <>Have an account? <button type="button" onClick={() => onSwitchMode && onSwitchMode('login')} className="text-blue-600">Login</button></>
          )}
        </div>
        <div>
          <button type="button" onClick={onClose} className="mr-2 text-sm text-gray-600">Cancel</button>
          <button disabled={loading} type="submit" className="btn btn-primary">
            {loading ? (mode === 'login' ? 'Signing in...' : 'Registering...') : (mode === 'login' ? 'Sign in' : 'Register')}
          </button>
        </div>
      </div>
    </form>
  );
}
