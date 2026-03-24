import type { NextAuthConfig } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

/**
 * Set NEXT_PUBLIC_SKIP_GOOGLE_CALENDAR_SCOPE=true to use only basic scopes
 * (openid, email, profile). Sign-in works without Google’s OAuth app verification
 * for Calendar. Calendar import/sync stays disabled until you remove this flag
 * and complete Testing users / verification in Google Cloud.
 */
const skipCalendarScope =
  process.env.NEXT_PUBLIC_SKIP_GOOGLE_CALENDAR_SCOPE === "true";

const googleScopes = skipCalendarScope
  ? "openid email profile"
  : "openid email profile https://www.googleapis.com/auth/calendar.readonly";

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: googleScopes,
          access_type: "offline",
          // consent forces re-auth + refresh token; only needed when requesting Calendar
          ...(skipCalendarScope ? {} : { prompt: "consent" as const }),
        },
      },
    }),
  ],
  pages: {
    signIn: '/api/auth/signin',
  },
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (profile?.sub) {
        token.id = profile.sub;
      } else if (user?.id) {
        token.id = user.id;
      }
      if (account) {
        token.googleAccessToken = account.access_token ?? undefined;
        token.googleRefreshToken =
          account.refresh_token ?? token.googleRefreshToken;
        token.googleExpiresAtSec = account.expires_at ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? '';
        session.googleCalendarConnected =
          Boolean(token.googleAccessToken) && !skipCalendarScope;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
