import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import type { NextRequest } from 'next/server';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
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

export async function GET(req: NextRequest) {
  return handler(req as any);
}

export async function POST(req: NextRequest) {
  return handler(req as any);
}
