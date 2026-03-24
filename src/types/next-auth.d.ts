import type { DefaultSession } from "next-auth";

declare module "next-auth/jwt" {
  interface JWT {
    googleAccessToken?: string;
    googleRefreshToken?: string;
    /** Unix seconds when the Google access token expires (OAuth `expires_at`). */
    googleExpiresAtSec?: number;
  }
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    /** Present when signed in with Google and calendar scope was granted. */
    googleCalendarConnected?: boolean;
  }
}
