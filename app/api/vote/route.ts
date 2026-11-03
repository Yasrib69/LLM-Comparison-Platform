
import { NextResponse } from "next/server";
import { saveVote } from "../../../lib/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { id, visitorId, winner } = await req.json();

    // Validate the voting request.
    if (
      typeof id !== "string" ||
      typeof visitorId !== "string" ||
      (winner !== "A" && winner !== "B")
    ) {
      return NextResponse.json(
        { error: "Invalid vote." },
        { status: 400 }
      );
    }

    // Save the vote to Neon PostgreSQL.
    const success = await saveVote(id, visitorId, winner);

    if (!success) {
      return NextResponse.json(
        {
          error:
            "Comparison not found, or a vote has already been recorded.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Voting error:", error);

    return NextResponse.json(
      { error: "Unable to save vote." },
      { status: 500 }
    );
  }
}
