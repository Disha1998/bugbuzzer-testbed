import { NextResponse } from "next/server";

// Batch 5 - unauthenticated-api-endpoint. Returns fake user records to any
// caller without auth check. Simulates a leaked /api/users endpoint.
export function GET() {
  return NextResponse.json({
    users: [
      { id: 1, email: "alice@fake-testbed.example", role: "admin", created_at: "2024-01-15" },
      { id: 2, email: "bob@fake-testbed.example", role: "user", created_at: "2024-02-20" },
      { id: 3, email: "carol@fake-testbed.example", role: "user", created_at: "2024-03-08" },
    ],
    total: 3,
  });
}
