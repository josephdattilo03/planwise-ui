import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL =
  process.env.PLANWISE_BACKEND_BASE_URL || "http://localhost:3001";

function buildBackendUrl(pathname: string, search: string) {
  // Incoming pathname looks like: /api/backend/<forwarded>
  // Forwarded pathname looks like: <forwarded>
  const forwardPrefix = "/api/backend/";
  const forwarded =
    pathname.startsWith(forwardPrefix)
      ? pathname.slice(forwardPrefix.length)
      : pathname.replace(/^\/api\/backend\/?/, "");

  // Avoid accidental double-slashes when users set a trailing slash.
  const base = BACKEND_BASE_URL.endsWith("/")
    ? BACKEND_BASE_URL.slice(0, -1)
    : BACKEND_BASE_URL;

  return `${base}/${forwarded}${search}`;
}

async function forwardRequest(req: NextRequest) {
  const url = buildBackendUrl(req.nextUrl.pathname, req.nextUrl.search);

  const init: RequestInit = {
    method: req.method,
    headers: {},
  };

  // For JSON APIs, keep request body as-is (as text) and preserve content-type.
  if (req.method !== "GET" && req.method !== "HEAD") {
    const bodyText = await req.text();
    if (bodyText) {
      init.body = bodyText;
    }

    const contentType = req.headers.get("content-type");
    if (contentType) {
      // NextRequest normalizes header names; we keep it as-is for the backend.
      (init.headers as Record<string, string>)["content-type"] = contentType;
    }
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(url, init);
  } catch (e) {
    return NextResponse.json(
      { error: "Backend request failed", details: String(e) },
      { status: 502 }
    );
  }

  const resText = await backendRes.text();
  const contentType = backendRes.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return new NextResponse(JSON.stringify(JSON.parse(resText)), {
        status: backendRes.status,
        headers: {
          "content-type": "application/json",
        },
      });
    } catch {
      // Fallback below (non-JSON or invalid JSON from backend)
    }
  }

  return new NextResponse(resText, {
    status: backendRes.status,
  });
}

export async function GET(req: NextRequest) {
  return forwardRequest(req);
}

export async function POST(req: NextRequest) {
  return forwardRequest(req);
}

export async function PUT(req: NextRequest) {
  return forwardRequest(req);
}

export async function DELETE(req: NextRequest) {
  return forwardRequest(req);
}

