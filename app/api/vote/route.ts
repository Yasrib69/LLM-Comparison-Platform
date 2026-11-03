import { NextResponse } from 'next/server';
import { transaction } from '../../../lib/store';
export const runtime = 'nodejs';
export async function POST(req: Request) {
  try {
    const { id, visitorId, winner } = await req.json();
    if (typeof id !== 'string' || typeof visitorId !== 'string' || (winner !== 'A' && winner !== 'B')) return NextResponse.json({ error: 'Invalid vote.' }, { status: 400 });
    const updated = await transaction((items) => {
      const match = items.find((v) => v.id === id && v.visitorId === visitorId);
      if (!match) return 'missing';
      if (match.winner !== null) return 'already';
      match.winner = winner;
      return 'ok';
    });
    if (updated !== 'ok') return NextResponse.json({ error: updated === 'already' ? 'Already voted.' : 'Comparison not found.' }, { status: 409 });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: 'Unable to save vote.' }, { status: 500 }); }
}
