import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Batch 5 - unauthenticated-ai-proxy-endpoint. Fake AI proxy that accepts
// any prompt without auth and returns an OpenAI-shaped chat completion.
export async function POST(request: NextRequest) {
  let prompt = "";
  try {
    const body = await request.json();
    prompt = body?.prompt ?? body?.messages?.[0]?.content ?? "";
  } catch {
    prompt = "";
  }

  return NextResponse.json({
    id: "chatcmpl-fake-testbed-0001",
    object: "chat.completion",
    created: 1700000000,
    model: "gpt-4-fake",
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: `Fake AI response to prompt: "${prompt.slice(0, 100)}" (testbed - no real model was called)`,
        },
        finish_reason: "stop",
      },
    ],
    usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
  });
}

export function GET() {
  return NextResponse.json({
    endpoint: "/api/ai/chat",
    accepts: "POST { prompt: string } or { messages: [...] }",
    auth_required: false,
    note: "fake testbed AI proxy",
  });
}
