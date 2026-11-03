
import { neon } from "@neondatabase/serverless";

export type Comparison = {
  id: string;
  visitorId: string;
  prompt: string;
  responseA: string;
  responseB: string;
  modelA: string;
  modelB: string;
  winner: "A" | "B" | null;
  createdAt: string;
};

// Connect to the Neon PostgreSQL database.
function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is missing.");
  }

  return neon(databaseUrl);
}

// Get all comparisons from the database.
export async function listComparisons(): Promise<Comparison[]> {
  const sql = getDatabase();

  const rows = await sql`
    SELECT
      id,
      visitor_id,
      prompt,
      response_a,
      response_b,
      model_a,
      model_b,
      winner,
      created_at
    FROM comparisons
    ORDER BY created_at DESC
  `;

  return rows.map((row) => ({
    id: String(row.id),
    visitorId: String(row.visitor_id),
    prompt: String(row.prompt),
    responseA: String(row.response_a),
    responseB: String(row.response_b),
    modelA: String(row.model_a),
    modelB: String(row.model_b),
    winner: row.winner as "A" | "B" | null,
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

// Save a new comparison.
export async function saveComparison(
  comparison: Comparison
): Promise<void> {
  const sql = getDatabase();

  await sql`
    INSERT INTO comparisons (
      id,
      visitor_id,
      prompt,
      response_a,
      response_b,
      model_a,
      model_b,
      winner,
      created_at
    )
    VALUES (
      ${comparison.id},
      ${comparison.visitorId},
      ${comparison.prompt},
      ${comparison.responseA},
      ${comparison.responseB},
      ${comparison.modelA},
      ${comparison.modelB},
      ${comparison.winner},
      ${comparison.createdAt}
    )
  `;
}

// Record one vote per comparison.
// The database update is atomic, preventing duplicate votes.
export async function saveVote(
  id: string,
  visitorId: string,
  winner: "A" | "B"
): Promise<boolean> {
  const sql = getDatabase();

  const result = await sql`
    UPDATE comparisons
    SET winner = ${winner}
    WHERE id = ${id}
      AND visitor_id = ${visitorId}
      AND winner IS NULL
    RETURNING id
  `;

  return result.length > 0;
}

// Calculate leaderboard statistics.
export function summary(items: Comparison[]) {
  const votes = items.filter((item) => item.winner !== null);

  const a = votes.filter((item) => item.winner === "A").length;
  const b = votes.filter((item) => item.winner === "B").length;

  const total = votes.length;

  return {
    total,
    a,
    b,
    aPercent: total ? Math.round((a * 100) / total) : 0,
    bPercent: total ? Math.round((b * 100) / total) : 0,
  };
}
