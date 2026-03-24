import type { NextAuthConfig } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  pages: {
    signIn: '/api/auth/signin',
  },
  callbacks: {
    jwt({ token, profile }) {
      if (profile?.sub) {
        token.id = profile.sub;
        console.log('[Auth] User signed in, id:', profile.sub);
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? '';
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
