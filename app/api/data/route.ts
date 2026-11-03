import { NextResponse } from 'next/server';
import { listComparisons, summary } from '../../../lib/store';
export const runtime = 'nodejs';
export async function GET(req: Request) {
  const visitorId = new URL(req.url).searchParams.get('visitorId');
  try {
    const items = await listComparisons();
    return NextResponse.json({ history: items.filter((v) => v.visitorId === visitorId), leaderboard: summary(items) });
  } catch { return NextResponse.json({ error: 'Unable to load history.' }, { status: 500 }); }
}
