
import { NextResponse } from "next/server";

import {
  generateGroq,
  generateCerebras,
  modelA,
  modelB,
} from "../../../lib/providers";

import { transaction, Comparison } from "../../../lib/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { prompt, visitorId } = await req.json();

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

    // Request responses from two different providers concurrently.
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

    // Save the comparison to persistent local storage.
    await transaction((items) => {
      items.unshift(entry);
    });

    return NextResponse.json(entry);
  } catch (error) {
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
