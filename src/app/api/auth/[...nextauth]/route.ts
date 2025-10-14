import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import type { NextRequest } from 'next/server';

// Keep authOptions private to this route module so it doesn't become a named export
// Validate environment variables early so we surface a clear error during server start
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  // Throwing here makes the problem visible during development instead of
  // producing an OAuth redirect with an invalid client_id.
  throw new Error('Missing Google OAuth credentials: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment (.env.local)');
}
const NEXTAUTH_URL = process.env.NEXTAUTH_URL;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
if (!NEXTAUTH_URL || !NEXTAUTH_SECRET) {
  throw new Error('Missing NextAuth configuration: set NEXTAUTH_URL and NEXTAUTH_SECRET in your environment');
}

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async session({ session, token }: any) {
      // Attach token info to session for server-side checks
      try {
        if (token && token.sub) session.user.id = token.sub;
      } catch (e) {}
      return session;
    }
  }
};

const handler = NextAuth(authOptions as any);

// App Router compatible exports
export { handler as GET, handler as POST };
