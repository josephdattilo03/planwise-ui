"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function getLocaleFromCookie(): string {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]+)/);
  const raw = match ? decodeURIComponent(match[1]) : "en";
  if (raw === "en" || raw === "es" || raw === "de") return raw;
  return "en";
}

/**
 * Legacy landing page after SAM `/auth/callback` redirect. Calendar sync runs in the
 * browser (`GoogleCalendarLoginSync`) after NextAuth sign-in; this page only forwards home.
 */
function GoogleAuthSuccessContent() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const locale = getLocaleFromCookie();
    const ok = params.get("google_connected") === "true";
    if (ok) {
      router.replace(`/${locale}/calendar`);
    } else {
      router.replace(`/${locale}`);
    }
  }, [params, router]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background text-foreground">
      <div className="text-lg font-semibold">Redirecting…</div>
    </div>
  );
}

export default function GoogleAuthSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center bg-background text-foreground">
          <div className="text-lg font-semibold">Loading…</div>
        </div>
      }
    >
      <GoogleAuthSuccessContent />
    </Suspense>
  );
}
