import type { NextConfig } from "next";

// Allow dev conveniences (Next.js HMR, source maps) while keeping
// production strict. Dev requires 'unsafe-eval' and websocket connections.
const isDev = process.env.NODE_ENV !== 'production';

const formAction = isDev
  ? "form-action 'self' http://localhost:3000 https://www.gamesta.in https://accounts.google.com"
  : "form-action 'self' https://www.gamesta.in https://accounts.google.com";

const ContentSecurityPolicy = [
  "default-src 'self'",
  // Razorpay Checkout loads an external script and embeds frames.
  `script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://*.razorpay.com${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  // Razorpay may load images (logos/icons) from its own domains.
  "img-src 'self' data: blob: https://*.razorpay.com https://checkout.razorpay.com https://authjs.dev",
  "font-src 'self'",
  // Razorpay Checkout performs network calls to Razorpay.
  `connect-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://*.razorpay.com${isDev ? " ws: wss:" : ''}`,
  // Razorpay Checkout uses iframes.
  "frame-src 'self' https://*.razorpay.com https://checkout.razorpay.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  formAction,
  "object-src 'none'",
].join('; ');

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
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
