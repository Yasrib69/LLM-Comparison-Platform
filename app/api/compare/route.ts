
import { NextResponse } from "next/server";

import {
  generateGroq,
  generateCerebras,
  modelA,
  modelB,
} from "../../../lib/providers";

import {
  saveComparison,
  type Comparison,
} from "../../../lib/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { prompt, visitorId } = await req.json();

    // Validate input.
    if (
      typeof prompt !== "string" ||
      !prompt.trim() ||
      prompt.length > 3000 ||
      typeof visitorId !== "string" ||
      !/^[a-f0-9-]{36}$/.test(visitorId)
    ) {
      return NextResponse.json(
        { error: "Enter a valid prompt and visitor ID." },
        { status: 400 }
      );
    }

    // Generate responses from two different LLM providers.
    const [responseA, responseB] = await Promise.all([
      generateGroq(prompt.trim()),
      generateCerebras(prompt.trim()),
    ]);

    const entry: Comparison = {
      id: crypto.randomUUID(),
      visitorId,
      prompt: prompt.trim(),
      responseA,
      responseB,
      modelA,
      modelB,
      winner: null,
      createdAt: new Date().toISOString(),
    };

    // Save the comparison to Neon PostgreSQL.
    await saveComparison(entry);

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Comparison error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to compare models.",
      },
      { status: 500 }
    );
  }
}
