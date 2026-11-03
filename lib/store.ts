import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export type Comparison = { id: string; visitorId: string; prompt: string; responseA: string; responseB: string; modelA: string; modelB: string; winner: 'A' | 'B' | null; createdAt: string };
const dataFile = path.join(process.cwd(), '.data', 'comparisons.json');
let queue: Promise<unknown> = Promise.resolve();

export async function listComparisons(): Promise<Comparison[]> {
  try { return JSON.parse(await readFile(dataFile, 'utf8')) as Comparison[]; }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []; throw error; }
}
async function save(data: Comparison[]) { await mkdir(path.dirname(dataFile), { recursive: true }); await writeFile(dataFile, JSON.stringify(data, null, 2)); }
export async function transaction<T>(fn: (items: Comparison[]) => Promise<T> | T): Promise<T> {
  const pending = queue.then(async () => { const items = await listComparisons(); const result = await fn(items); await save(items); return result; });
  queue = pending.catch(() => {});
  return pending;
}
export function summary(items: Comparison[]) {
  const votes = items.filter((v) => v.winner !== null);
  const a = votes.filter((v) => v.winner === 'A').length;
  const b = votes.filter((v) => v.winner === 'B').length;
  return { total: votes.length, a, b, aPercent: votes.length ? Math.round(a * 100 / votes.length) : 0, bPercent: votes.length ? Math.round(b * 100 / votes.length) : 0 };
}
