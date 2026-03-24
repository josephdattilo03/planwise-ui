"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getGoogleCalendarStorage,
  importGoogleCalendarEvents,
} from "@/src/app/services/googleCalendarService";

function getLocaleFromCookie(): string {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]+)/);
  const raw = match ? decodeURIComponent(match[1]) : "en";
  if (raw === "en" || raw === "es" || raw === "de") return raw;
  return "en";
}

export default function GoogleAuthSuccessPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error" | "done">("loading");
  const [message, setMessage] = useState("Connecting to Google Calendar...");

  const userId = useMemo(() => params.get("user_id") ?? "", [params]);
  const connected = useMemo(
    () => params.get("google_connected") === "true",
    [params],
  );

  useEffect(() => {
    const run = async () => {
      if (!userId || !connected) {
        setStatus("error");
        setMessage("Missing Google connection details. Please try again.");
        return;
      }

      try {
        const storage = getGoogleCalendarStorage();
        const calendarId =
          localStorage.getItem(storage.calendarIdKey) ?? "primary";

        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(start);
        end.setMonth(end.getMonth() + 3);

        await importGoogleCalendarEvents({
          userId,
          calendarId,
          timeMin: start.toISOString(),
          timeMax: end.toISOString(),
        });

        localStorage.setItem(storage.connectedKey, "true");
        localStorage.removeItem(storage.eventsKey);
        localStorage.setItem(storage.lastSyncedKey, new Date().toISOString());

        setStatus("done");
        setMessage("Google Calendar connected. Redirecting...");
        const locale = getLocaleFromCookie();
        router.replace(`/${locale}/calendar`);
      } catch (err) {
        setStatus("error");
        setMessage(
          "Failed to sync Google Calendar. Please return to the calendar and try again.",
        );
      }
    };

    run();
  }, [connected, params, router, userId]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="text-lg font-semibold">{message}</div>
        {status === "loading" && (
          <div className="text-sm text-muted">This may take a few seconds.</div>
        )}
        {status === "error" && (
          <button
            onClick={() => router.push("/")}
            className="mt-2 rounded-md border border-beige px-4 py-2 text-sm text-foreground hover:bg-beige transition"
          >
            Return to Home
          </button>
        )}
      </div>
    </div>
  );
}
