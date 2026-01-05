import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CRITICAL: Allow access to auth API routes FIRST
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Extract locale and path without locale
  // e.g., /en/notes -> /notes, /en -> /
  const localeMatch = pathname.match(/^\/(en|es|de)(\/.*)?$/);
  const pathWithoutLocale = localeMatch ? localeMatch[2] || "/" : pathname;

  // Check for NextAuth session cookie
  const sessionCookie =
    request.cookies.get("authjs.session-token") ||
    request.cookies.get("__Secure-authjs.session-token");

  const hasSession = !!sessionCookie?.value;

  // Allow root path (/en, /es, /de, or /) to be accessible when unauthenticated
  // This is where the sign-in UI is shown
  const isRootPath = pathWithoutLocale === "/";

  // If no session and trying to access a protected route (not root), redirect to root
  if (!hasSession && !isRootPath) {
    console.log("redirecting");

    // Redirect to the locale root (e.g., /en) where sign-in UI is shown
    const locale = localeMatch?.[1] || routing.defaultLocale;
    const rootUrl = new URL(`/${locale}`, request.url);
    // IMPORTANT: Return the redirect immediately, don't call intlMiddleware
    return NextResponse.redirect(rootUrl);
  }

  // Only proceed with intl middleware if authenticated or on root path
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api/auth|api/trpc|_next|_vercel|.*\\..*).*)"],
};
