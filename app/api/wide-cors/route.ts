import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Deliberately misconfigured CORS endpoint so BugBuzzer's
// cors-misconfiguration-overly-permissive check fires.
//
// Reflects any incoming Origin AND sets Allow-Credentials: true — the classic
// "arbitrary origin reflection with credentials" bug that lets attacker sites
// read authenticated responses in a victim's browser.

function corsHeaders(request: NextRequest): HeadersInit {
  const origin = request.headers.get("origin") ?? "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { data: "public-testbed-payload", note: "cors-misconfig demo" },
    { headers: corsHeaders(request) },
  );
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}
