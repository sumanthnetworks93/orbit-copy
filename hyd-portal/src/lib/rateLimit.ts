import { prisma } from './prisma';

export async function hitRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = new Date();
  const existing = await prisma.rateLimit.findUnique({ where: { key } });
  if (!existing || existing.windowEnd < now) {
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, windowEnd: new Date(now.getTime() + windowMs) },
      update: { count: 1, windowEnd: new Date(now.getTime() + windowMs) },
    });
    return true;
  }
  if (existing.count >= limit) return false;
  await prisma.rateLimit.update({
    where: { key },
    data: { count: { increment: 1 } },
  });
  return true;
}
