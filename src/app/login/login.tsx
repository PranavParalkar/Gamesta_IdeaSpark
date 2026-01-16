"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PrismaticBurst from '../../components/ui/PrismaticBurst';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [prn, setPrn] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const exchangeOAuthTokenAndRedirect = async () => {
    try {
      const res = await fetch('/api/auth/oauth-token');
      if (!res.ok) return;
      const json = await res.json();
      sessionStorage.setItem('gamesta_token', json.token);
      // Hard navigate to home with full refresh
      if (typeof window !== 'undefined') window.location.assign('/');
    } catch (e) {
      console.error('OAuth exchange error', e);
    }
  };

  const openCenteredPopup = (url: string) => {
    const width = 520;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2.5;
    return window.open(
      url,
      'gamesta-google-oauth',
      `popup=yes,width=${width},height=${height},left=${left},top=${top}`
    );
  };

  const handleGoogleAuth = () => {
    if (typeof window === 'undefined') return;

    // Use a popup so the main tab doesn't navigate away.
    // Note: Google blocks iframing; popup is the supported UX.
    const callbackUrl = `${window.location.origin}/login?oauth=popup`;
    const authUrl = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`;

    const popup = openCenteredPopup(authUrl);
    if (!popup) {
      // Popup blocked: fall back to full-page redirect.
      window.location.href = authUrl;
    }
  };

  // Preserved OAuth logic
  useEffect(() => {
    try {
      const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
      const oauth = params.get('oauth');
      if (oauth === '1') exchangeOAuthTokenAndRedirect();

      // Popup flow: the OAuth callback lands here in the popup.
      // Notify the opener to exchange the token, then close the popup.
      if (oauth === 'popup') {
        if (typeof window !== 'undefined' && window.opener && !window.opener.closed) {
          window.opener.postMessage({ type: 'gamesta_oauth_complete' }, window.location.origin);
          window.close();
          return;
        }

        // Fallback: if this URL loaded in the main tab, just complete the exchange here.
        exchangeOAuthTokenAndRedirect();
      }
    } catch (e) {
      console.error('Error parsing URL params', e);
    }
  }, [router]);

  // Listen for the popup to complete OAuth, then exchange the session for our app token.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (!event.data || (event.data as any).type !== 'gamesta_oauth_complete') return;
      exchangeOAuthTokenAndRedirect();
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // Preserved Auto-lookup name/email when PRN is entered
  useEffect(() => {
    (async () => {
      try {
        const prnRegex = /^\d{12}$/;
        if (!prnRegex.test(prn)) return;
        const res = await fetch(`/api/auth/lookup?prn=${encodeURIComponent(prn)}`);
        if (!res.ok) return;
        const json = await res.json();
        const data = json.data || {};
        if (data.name) setName(data.name);
        if (data.email) setEmail(data.email);
      } catch (e) {
        // ignore lookup errors
      }
    })();
  }, [prn]);

  // Preserved Submit logic
  async function submit(e: React.FormEvent, mode: 'login' | 'register') {
    e.preventDefault();
    setError(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (mode === 'login') {
      if (!email || !emailRegex.test(email)) return setError('Please enter a valid email address');
    }
    if (mode === 'register') {
      if (!name || name.trim().length === 0) return setError('Please provide your name');
      if (!email || !emailRegex.test(email)) return setError('Please enter a valid email address');
    }
    if (!password || password.length < 6) return setError('Password must be at least 6 characters');

    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/signin' : '/api/auth/signup';
      const res = await fetch(endpoint, { 
        method: 'POST', 
        body: JSON.stringify({ 
          email: email, 
          password: password, 
          name: name || email.split('@')[0]
        }), 
        headers: { 'Content-Type': 'application/json' } 
      });
      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem('gamesta_token', data.token);
        toast.success(`Welcome ${name}!`);
        // Hard navigate to home with full refresh
        if (typeof window !== 'undefined') window.location.assign('/');
      } else {
        const json = await res.json().catch(() => null);
        const errorMsg = (json && json.error) || 'Failed to sign in';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (e: any) {
      const errorMsg = e?.message || 'Failed to sign in';
      setError(errorMsg);
      toast.error(errorMsg);
    }
    setLoading(false);
  }

  return (
    <div className="gamesta-auth relative flex flex-col items-center justify-center mt-20 bg-[#1a1a2e] p-5 text-white overflow-hidden">
      {/* Background PrismaticBurst */}
      <div className="fixed inset-0 pointer-events-none">
        <PrismaticBurst
          intensity={0.6}
          speed={0.8}
          animationType="rotate3d"
          colors={["#ff5ec8", "#7a5cff", "#00f6ff"]}
          mixBlendMode="screen"
        />
      </div>

      {/* Auth Wrapper (matches legacy AuthScreen structure) */}
      <div
        className={`auth-wrapper relative bg-black rounded-4xl w-full max-w-[800px] h-[500px] border-2 border-fuchsia-500 shadow-[0_0_25px_rgba(217,70,239,0.5)] overflow-hidden transition-all duration-700 z-10 
        max-md:h-auto max-md:min-h-[500px] max-md:flex max-md:flex-col ${isRegisterMode ? 'toggled' : ''}`}
      >
        
        {/* Background Shapes (mapped to legacy classes) */}
        <div className="background-shape max-md:hidden" />
        <div className="secondary-shape max-md:hidden" />

        {/* ===== Sign In Panel ===== */}
        <div
          className={`credentials-panel signin absolute top-0 left-0 w-1/2 h-full flex flex-col justify-center px-10 transition-all duration-700
          max-md:absolute max-md:inset-0 max-md:w-full max-md:p-8
          ${isRegisterMode 
            ? 'opacity-0 translate-x-[-120%] z-0 max-md:pointer-events-none' 
            : 'opacity-100 translate-x-0 z-10'}`}
        >
          <h2
            className={`slide-element text-4xl text-center text-white mb-5 transition-transform duration-700 delay-[1100ms]
             ${isRegisterMode ? 'opacity-0 -translate-x-full' : 'opacity-100 translate-x-0'}
             max-md:delay-100 max-md:opacity-100`}
          >
            Login
          </h2>
          <form onSubmit={(e) => submit(e, 'login')}>
            
            {/* Email Field */}
            <div
              className={`field-wrapper slide-element relative w-full h-[50px] mt-6 transition-transform duration-700 delay-[1200ms]
               ${isRegisterMode ? 'opacity-0 -translate-x-full' : 'opacity-100 translate-x-0'}
               max-md:delay-200 max-md:opacity-100`}
            >
              <input 
                type="text" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                className="peer w-full h-full bg-black border-none outline-none text-base text-white font-semibold border-b-2  pr-6 transition-all duration-500 "
              />
              <label className="absolute top-1/2 left-0 -translate-y-1/2 text-base text-white transition-all duration-500 pointer-events-none peer-focus:-top-[5px] peer-focus:text-fuchsia-400 peer-valid:-top-[5px] peer-valid:text-fuchsia-400 peer-[&:not(:placeholder-shown)]:-top-[5px] peer-[&:not(:placeholder-shown)]:text-fuchsia-400">
                Email Address
              </label>
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 448 512" 
                className="absolute top-1/2 right-0 -translate-y-1/2 text-lg text-white transition-colors duration-500 peer-focus:text-fuchsia-400 peer-valid:text-fuchsia-400 peer-[&:not(:placeholder-shown)]:text-fuchsia-400">
                <path fill="currentColor" d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0S96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"/>
              </svg>
            </div>

           {/* Password Field */}
          <div
            className={`field-wrapper slide-element relative w-full h-[50px] mt-6 transition-transform duration-700 delay-[1300ms]
   ${isRegisterMode ? 'opacity-0 -translate-x-full' : 'opacity-100 translate-x-0'}
   max-md:delay-300 max-md:opacity-100`}
          >

  <input 
    type={showPassword ? "text" : "password"}
    required 
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder=" "
    className="peer w-full h-full bg-transparent border-none outline-none text-base text-white font-semibold
               border-b-2 border-white pr-10 transition-all duration-500
               focus:border-fuchsia-400 valid:border-fuchsia-400 placeholder-shown:border-white"
  />

  <label className="absolute top-1/2 left-0 -translate-y-1/2 text-base text-white transition-all duration-500
                     pointer-events-none peer-focus:-top-[5px] peer-focus:text-fuchsia-400
                     peer-valid:-top-[5px] peer-valid:text-fuchsia-400
                     peer-[&:not(:placeholder-shown)]:-top-[5px]
                     peer-[&:not(:placeholder-shown)]:text-fuchsia-400">
    Password
  </label>

  {/* Show / Hide Button */}
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute top-1/2 right-0 -translate-y-1/2 text-white text-lg
               hover:text-fuchsia-400 transition-colors duration-300"
  >
    {showPassword ? (
      // Eye Slash Icon
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 640 512">
        <path fill="currentColor"
          d="M320 400c-75.9 0-137.25-58.71-142.9-133.17l-72.18-55.58C63.1 243.47 27.94 285.9 8.6 320c19.34 34.1 54.5 76.53 96.32 108.75C155.3 461.6 230.2 496 320 496c47.2 0 90.4-9.5 128.2-25.8l-49.7-38.3C373.6 393.8 347.6 400 320 400zM633.8 458.1l-110.5-85.1c29.5-23.4 54.5-50.5 73.1-75.1c-19.3-34.1-54.5-76.5-96.3-108.7C449.7 50.4 374.8 16 285 16c-47.2 0-90.4 9.5-128.2 25.8L6.1 53.1L38.2 95.2l595.6 459.6z" />
      </svg>
    ) : (
      // Eye Icon
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 576 512">
        <path fill="currentColor"
          d="M572.52 241.4C518.29 135.6 407.4 64 288 64S57.68 135.6 3.48 241.4a32.35 32.35 0 0 0 0 29.2C57.71 376.4 168.6 448 288 448s230.32-71.6 284.52-177.4a32.35 32.35 0 0 0 0-29.2zM288 400a112 112 0 1 1 112-112a112 112 0 0 1-112 112z" />
      </svg>
    )}
  </button>
</div>


            {error && !isRegisterMode && (
              <div
                className={`slide-element mt-3 text-red-400 text-sm text-center transition-transform duration-700 delay-[1400ms]
                ${isRegisterMode ? 'opacity-0 -translate-x-full' : 'opacity-100 translate-x-0'}`}>
                {error}
              </div>
            )}

            <div
              className={`field-wrapper slide-element relative w-full h-[45px] mt-6 transition-transform duration-700 delay-[1400ms]
               ${isRegisterMode ? 'opacity-0 -translate-x-full' : 'opacity-100 translate-x-0'}
               max-md:delay-400 max-md:opacity-100`}
            >
              <button
                className="submit-button group relative w-full h-full bg-transparent rounded-full border-2 border-fuchsia-500 font-semibold text-white overflow-hidden z-10 cursor-pointer"
                type="submit"
                disabled={loading}
              >
                <span className="absolute top-full left-0 w-full h-[300%] bg-gradient-to-b from-[#1a1a2e] via-fuchsia-500 to-fuchsia-500 -z-10 transition-all duration-500 group-hover:top-0"></span>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>

            
            <div
              className={`slide-element mt-3 text-center text-xs text-white/60 transition-transform duration-700 delay-[1550ms]
               ${isRegisterMode ? 'opacity-0 -translate-x-full' : 'opacity-100 translate-x-0'}
               max-md:delay-[550ms] max-md:opacity-100`}
            >
              <div className="flex items-center gap-2">
                <span className="flex-1 h-px bg-white/10" />
                <span>or continue with</span>
                <span className="flex-1 h-px bg-white/10" />
              </div>
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="group mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-white text-black px-4 py-2 text-xs font-semibold
                           transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-[0_0_18px_rgba(248,250,252,0.4)]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="h-4 w-4 transition-transform duration-300 group-hover:scale-110"
                >
                  <path
                    fill="#FFC107"
                    d="M43.6 20.5H42V20H24v8h11.3C33.8 31.9 29.3 35 24 35 16.8 35 11 29.2 11 22s5.8-13 13-13c3.3 0 6.3 1.2 8.6 3.4l5.7-5.7C34.6 3.3 29.6 1 24 1 11.8 1 2 10.8 2 23s9.8 22 22 22 22-9.8 22-22c0-1.3-.1-2.3-.4-3.5z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.3 14.7l6.6 4.8C14.3 16.2 18.8 13 24 13c3.3 0 6.3 1.2 8.6 3.4l5.7-5.7C34.6 7.3 29.6 5 24 5 16.1 5 9.4 9.1 6.3 14.7z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 41c5.2 0 10.1-2 13.7-5.3l-6.3-5.3C29.2 31.9 26.8 33 24 33c-5.2 0-9.7-3.1-11.6-7.6l-6.6 5C9.4 38.9 16.1 43 24 43z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.6 20.5H42V20H24v8h11.3c-1.3 2.9-3.5 5.1-6.3 6.4l6.3 5.3C37.1 40.2 42 36 44.7 29.9c-.8-2.4-1.1-4.7-1.1-7.4z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>
            </div>
                        {/* Mobile switch to Register */}
<div className="mt-4 text-center md:hidden">
  <p className="text-sm text-white/70">
    Don&apos;t have an account?
  </p>
  <button
    type="button"
    onClick={() => {
      setIsRegisterMode(true);
      setError(null);
    }}
    className="mt-2 text-fuchsia-400 font-semibold underline"
  >
    Sign Up
  </button>
</div>

          </form>
        </div>

        {/* ===== Welcome Section - Sign In (Right Side) ===== */}
        <div
          className={`welcome-section signin absolute top-0 right-0 w-1/2 h-full flex flex-col justify-center text-right pr-10 pl-[150px] transition-all duration-700
          max-md:hidden
          ${isRegisterMode ? 'opacity-0 translate-x-[120%] blur-[10px]' : 'opacity-100 translate-x-0 blur-0'}`}
        >
          <h2
            className={`slide-element text-4xl text-center text-white uppercase leading-tight mb-2 transition-all duration-700 delay-[1000ms] pointer-events-none
             ${isRegisterMode ? 'translate-x-[120%]' : 'translate-x-0'}`}
          >
            WELCOME BACK!
          </h2>
          <div
              className={`switch-link slide-element mt-5 mb-2 text-right text-sm text-white transition-transform duration-700 delay-[1500ms]
               ${isRegisterMode ? 'opacity-0 -translate-x-full' : 'opacity-100 translate-x-0'}
               max-md:delay-500 max-md:opacity-100`}
            >
              <p>
                Don&apos;t have an account? <br />
                <button
                  type="button"
                  className="text-fuchsia-400 bg-white font-semibold px-2 hover:bg-white/70   mt-3 p-1 rounded-lg border-none cursor-pointer pointer-events-auto"
                  onClick={() => {
                    setIsRegisterMode(true);
                    setError(null);
                  }}
                >
                  Sign Up
                </button>
              </p>
            </div>

        </div>
        

        {/* ===== Sign Up Panel (Right Side) ===== */}
        <div
          className={`credentials-panel signup absolute top-0 -right-5 w-1/2 h-full flex flex-col justify-center px-[60px] transition-all duration-700
          max-md:absolute max-md:inset-0 max-md:w-full max-md:p-8 max-md:left-0
          ${isRegisterMode 
            ? 'opacity-100 translate-x-0 z-10' 
            : 'opacity-0 translate-x-[120%] z-0 max-md:pointer-events-none'}`}
        >
          <h2
            className={`slide-element text-4xl text-center text-white mb-5 transition-transform duration-700 delay-0
             ${isRegisterMode ? 'opacity-100 translate-x-0 delay-[700ms]' : 'opacity-0 translate-x-[120%] blur-[10px]'}
             max-md:delay-100 max-md:opacity-100`}
          >
            Register
          </h2>
          <form onSubmit={(e) => submit(e, 'register')}>
            
            {/* Name Field */}
            <div
              className={`field-wrapper slide-element relative w-full h-[50px] mt-6 transition-transform duration-700
               ${isRegisterMode ? 'opacity-100 translate-x-0 delay-[800ms]' : 'opacity-0 translate-x-[120%] blur-[10px] delay-[100ms]'}
               max-md:delay-200 max-md:opacity-100`}
            >
              <input 
                type="text" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder=" "
                className="peer w-full h-full bg-transparent border-none outline-none text-base text-white font-semibold border-b-2 border-white pr-6 transition-all duration-500 focus:border-fuchsia-400 valid:border-fuchsia-400 placeholder-shown:border-white"
              />
              <label className="absolute top-1/2 left-0 -translate-y-1/2 text-base text-white transition-all duration-500 pointer-events-none peer-focus:-top-[5px] peer-focus:text-fuchsia-400 peer-valid:-top-[5px] peer-valid:text-fuchsia-400 peer-[&:not(:placeholder-shown)]:-top-[5px] peer-[&:not(:placeholder-shown)]:text-fuchsia-400">
                Full Name
              </label>
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 448 512" 
                className="absolute top-1/2 right-0 -translate-y-1/2 text-lg text-white transition-colors duration-500 peer-focus:text-fuchsia-400 peer-valid:text-fuchsia-400 peer-[&:not(:placeholder-shown)]:text-fuchsia-400">
                <path fill="currentColor" d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0S96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"/>
              </svg>
            </div>

            {/* Email Field */}
            <div
              className={`field-wrapper slide-element relative w-full h-[50px] mt-6 transition-transform duration-700
               ${isRegisterMode ? 'opacity-100 translate-x-0 delay-[900ms]' : 'opacity-0 translate-x-[120%] blur-[10px] delay-[200ms]'}
               max-md:delay-300 max-md:opacity-100`}
            >
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                className="peer w-full h-full bg-transparent border-none outline-none text-base text-white font-semibold border-b-2 border-white pr-6 transition-all duration-500 focus:border-fuchsia-400 valid:border-fuchsia-400 placeholder-shown:border-white"
              />
              <label className="absolute top-1/2 left-0 -translate-y-1/2 text-base text-white transition-all duration-500 pointer-events-none peer-focus:-top-[5px] peer-focus:text-fuchsia-400 peer-valid:-top-[5px] peer-valid:text-fuchsia-400 peer-[&:not(:placeholder-shown)]:-top-[5px] peer-[&:not(:placeholder-shown)]:text-fuchsia-400">
                Email Address
              </label>
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512" 
                className="absolute top-1/2 right-0 -translate-y-1/2 text-lg text-white transition-colors duration-500 peer-focus:text-fuchsia-400 peer-valid:text-fuchsia-400 peer-[&:not(:placeholder-shown)]:text-fuchsia-400">
                <path fill="currentColor" d="M502.3 190.8c3.9-3.1 9.7-.2 9.7 4.7V400c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V195.6c0-5 5.7-7.8 9.7-4.7c22.4 17.4 52.1 39.5 154.1 113.6c21.1 15.4 56.7 47.8 92.2 47.6c35.7.3 72-32.8 92.3-47.6c102-74.1 131.6-96.3 154-113.7zM256 320c23.2.4 56.6-29.2 73.4-41.4c132.7-96.3 142.8-104.7 173.4-128.7c5.8-4.5 9.2-11.5 9.2-18.9v-19c0-26.5-21.5-48-48-48H48C21.5 64 0 85.5 0 112v19c0 7.4 3.4 14.3 9.2 18.9c30.6 23.9 40.7 32.4 173.4 128.7c16.8 12.2 50.2 41.8 73.4 41.4z"/>
              </svg>
            </div>

            {/* Password Field */}
            <div
              className={`field-wrapper slide-element relative w-full h-[50px] mt-6 transition-transform duration-700
               ${isRegisterMode ? 'opacity-100 translate-x-0 delay-[1000ms]' : 'opacity-0 translate-x-[120%] blur-[10px] delay-[300ms]'}
               max-md:delay-400 max-md:opacity-100`}
            >
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                className="peer w-full h-full bg-transparent border-none outline-none text-base text-white font-semibold border-b-2 border-white pr-6 transition-all duration-500 focus:border-fuchsia-400 valid:border-fuchsia-400 placeholder-shown:border-white"
              />
              <label className="absolute top-1/2 left-0 -translate-y-1/2 text-base text-white transition-all duration-500 pointer-events-none peer-focus:-top-[5px] peer-focus:text-fuchsia-400 peer-valid:-top-[5px] peer-valid:text-fuchsia-400 peer-[&:not(:placeholder-shown)]:-top-[5px] peer-[&:not(:placeholder-shown)]:text-fuchsia-400">
                Password
              </label>
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 448 512" 
                className="absolute top-1/2 right-0 -translate-y-1/2 text-lg text-white transition-colors duration-500 peer-focus:text-fuchsia-400 peer-valid:text-fuchsia-400 peer-[&:not(:placeholder-shown)]:text-fuchsia-400">
                <path fill="currentColor" d="M400 224h-24v-72C376 68.2 307.8 0 224 0S72 68.2 72 152v72H48c-26.5 0-48 21.5-48 48v192c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V272c0-26.5-21.5-48-48-48zm-104 0H152v-72c0-39.7 32.3-72 72-72s72 32.3 72 72v72z"/>
              </svg>
            </div>
            
            {error && isRegisterMode && (
              <div
                className={`slide-element mt-3 text-red-400 text-sm text-center transition-transform duration-700 delay-[1100ms]
                ${isRegisterMode ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[120%]'}`}
              >
                {error}
              </div>
            )}

            <div
              className={`field-wrapper slide-element relative w-full h-[45px] mt-6 transition-transform duration-700
               ${isRegisterMode ? 'opacity-100 translate-x-0 delay-[1100ms]' : 'opacity-0 translate-x-[120%] blur-[10px] delay-[400ms]'}
               max-md:delay-[500ms] max-md:opacity-100`}
            >
              <button
                className="submit-button group relative w-full h-full bg-transparent rounded-full border-2 border-fuchsia-500 font-semibold text-white overflow-hidden z-10 cursor-pointer"
                type="submit"
                disabled={loading}
              >
                <span className="absolute top-full left-0 w-full h-[300%] bg-gradient-to-b from-[#1a1a2e] via-fuchsia-500 to-fuchsia-500 -z-10 transition-all duration-500 group-hover:top-0"></span>
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>


            <div
              className={`slide-element mt-3 text-center text-xs text-white/60 transition-transform duration-700 delay-[1250ms]
               ${isRegisterMode ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[120%]'}
               max-md:delay-[650ms] max-md:opacity-100`}
            >
              <div className="flex items-center gap-2">
                <span className="flex-1 h-px bg-white/10" />
                <span>or continue with</span>
                <span className="flex-1 h-px bg-white/10" />
              </div>
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="group mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-white text-black px-4 py-2 text-xs font-semibold
                           transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-[0_0_18px_rgba(248,250,252,0.4)]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="h-4 w-4 transition-transform duration-300 group-hover:scale-110"
                >
                  <path
                    fill="#FFC107"
                    d="M43.6 20.5H42V20H24v8h11.3C33.8 31.9 29.3 35 24 35 16.8 35 11 29.2 11 22s5.8-13 13-13c3.3 0 6.3 1.2 8.6 3.4l5.7-5.7C34.6 3.3 29.6 1 24 1 11.8 1 2 10.8 2 23s9.8 22 22 22 22-9.8 22-22c0-1.3-.1-2.3-.4-3.5z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.3 14.7l6.6 4.8C14.3 16.2 18.8 13 24 13c3.3 0 6.3 1.2 8.6 3.4l5.7-5.7C34.6 7.3 29.6 5 24 5 16.1 5 9.4 9.1 6.3 14.7z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 41c5.2 0 10.1-2 13.7-5.3l-6.3-5.3C29.2 31.9 26.8 33 24 33c-5.2 0-9.7-3.1-11.6-7.6l-6.6 5C9.4 38.9 16.1 43 24 43z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.6 20.5H42V20H24v8h11.3c-1.3 2.9-3.5 5.1-6.3 6.4l6.3 5.3C37.1 40.2 42 36 44.7 29.9c-.8-2.4-1.1-4.7-1.1-7.4z"
                  />
                </svg>
                <span>Sign up with Google</span>
              </button>
            </div>
                        {/* Mobile switch to Login */}
<div className="mt-4 text-center md:hidden">
  <p className="text-sm text-white/70">
    Already have an account?
  </p>
  <button
    type="button"
    onClick={() => {
      setIsRegisterMode(false);
      setError(null);
    }}
    className="mt-2 text-fuchsia-400 font-semibold underline"
  >
    Sign In
  </button>
</div>
          </form>
        </div>

        {/* ===== Welcome Section - Sign Up (Left Side) ===== */}
        <div
          className={`welcome-section signup absolute top-0 left-0 w-1/2 h-full flex flex-col justify-center text-left pl-[38px] pr-[150px] transition-all duration-700
          max-md:hidden
          ${isRegisterMode ? 'opacity-100 translate-x-0 blur-0' : 'opacity-0 translate-x-[-120%] blur-[10px]'}`}
        >
          <h2
            className={`slide-element text-4xl text-white text-center uppercase leading-tight mb-2 transition-all duration-700 delay-0 pointer-events-none
             ${isRegisterMode ? 'translate-x-0 delay-[200ms]' : 'translate-x-[120%]'}`}
          >
            WELCOME!
          </h2>

          <div
            className={`switch-link slide-element mt-5 mb-2 text-left text-sm text-white transition-transform duration-700 delay-[1200ms]
             ${isRegisterMode ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[-120%]'}
             max-md:delay-[600ms] max-md:opacity-100`}
          >
            <p>
              Already have an account? <br />
              <button
                type="button"
                className="text-fuchsia-400 bg-white font-semibold px-2 hover:bg-white/70   mt-3 p-1 rounded-lg border-none cursor-pointer pointer-events-auto"
                onClick={() => {
                  setIsRegisterMode(false);
                  setError(null);
                }}
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

      </div>
      <div className="mt-8 text-center text-sm text-white">
        <p>Made with ❤️ by <a href="#" target="_blank" className="text-fuchsia-400 font-bold hover:underline hover:text-[#00b8d4] transition-colors">Gamesta</a></p>
      </div>
    </div>
  );
}
