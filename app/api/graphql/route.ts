import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Batch 5 - graphql-introspection-enabled. Fake GraphQL endpoint that
// responds to introspection queries with a full schema dump.
const INTROSPECTION_RESPONSE = {
  data: {
    __schema: {
      queryType: { name: "Query" },
      mutationType: { name: "Mutation" },
      types: [
        { name: "Query", kind: "OBJECT" },
        { name: "Mutation", kind: "OBJECT" },
        { name: "User", kind: "OBJECT" },
        { name: "Post", kind: "OBJECT" },
        { name: "String", kind: "SCALAR" },
        { name: "Int", kind: "SCALAR" },
        { name: "Boolean", kind: "SCALAR" },
      ],
    },
  },
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  if (body.includes("__schema") || body.includes("IntrospectionQuery")) {
    return NextResponse.json(INTROSPECTION_RESPONSE);
  }
  return NextResponse.json({ data: null });
}

export function GET() {
  return NextResponse.json(INTROSPECTION_RESPONSE);
}
