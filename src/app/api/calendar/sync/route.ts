import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

import { GOOGLE_CALENDAR_BOARD_ID } from "@/src/app/services/googleCalendarService";

/**
 * Server-side: forwards NextAuth Google OAuth tokens to planwise-api import-calendar
 * with insert_only=true (one DynamoDB prefix query + batched writes on the backend).
 */
export async function POST(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_SKIP_GOOGLE_CALENDAR_SCOPE === "true") {
    return NextResponse.json({
      skipped: true,
      reason: "calendar_scope_disabled_in_env",
    });
  }

  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "missing_auth_secret" }, { status: 500 });
  }

  const token = await getToken({ req, secret });
  if (!token?.email || !token.googleAccessToken) {
    return NextResponse.json({
      skipped: true,
      reason: "no_google_calendar_token",
    });
  }

  const backend =
    process.env.PLANWISE_BACKEND_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_DEV ||
    "http://localhost:3001";

  const userId = token.email as string;
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 3);

  const params = new URLSearchParams({
    calendar_id: "primary",
    time_min: start.toISOString(),
    time_max: end.toISOString(),
    insert_only: "true",
  });

  const base = backend.replace(/\/$/, "");
  const url = `${base}/user/${encodeURIComponent(userId)}/board/${encodeURIComponent(
    GOOGLE_CALENDAR_BOARD_ID,
  )}/import-calendar?${params}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      access_token: token.googleAccessToken,
      refresh_token: token.googleRefreshToken ?? null,
      access_token_expires_at: token.googleExpiresAtSec ?? null,
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json(
      { error: "backend_import_failed", detail: text.slice(0, 800) },
      { status: 502 },
    );
  }

  try {
    return NextResponse.json(JSON.parse(text));
  } catch {
    return NextResponse.json(
      { error: "invalid_backend_json", detail: text.slice(0, 200) },
      { status: 502 },
    );
  }
}
