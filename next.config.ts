import type { NextConfig } from "next";

// Build a strict CSP for production and a relaxed one for dev (to support webpack eval & HMR)
const isProd = process.env.NODE_ENV === 'production';

const cspDirectives: string[] = [
  "default-src 'self'",
  // Next.js dev server and some tooling rely on eval(); only allow it locally
  isProd
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  // Next.js dev server and some tooling rely on eval(); only allow it locally
  isProd
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  // Allow websocket connections for HMR in dev
  isProd ? "connect-src 'self'" : "connect-src 'self' ws: wss:",
  // Allow websocket connections for HMR in dev
  isProd ? "connect-src 'self'" : "connect-src 'self' ws: wss:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
];

const ContentSecurityPolicy = cspDirectives.join('; ');
];

const ContentSecurityPolicy = cspDirectives.join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
];

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
