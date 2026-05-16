import 'dotenv/config';
import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { redis } from '../lib/redis';

const db = new PrismaClient();

function subHours(date: Date, hours: number): Date {
  return new Date(date.getTime() - hours * 60 * 60 * 1000);
}

function mapToMood(genre = '', bpm = 100): string | null {
  const g = genre.toLowerCase();
  if ((g.includes('hip') || g.includes('trap') || g.includes('edm')) && bpm > 120) return 'hype';
  if ((g.includes('lo-fi') || g.includes('ambient') || g.includes('indie')) && bpm < 100) return 'chill';
  if ((g.includes('classical') || g.includes('instrumental')) && bpm >= 80) return 'focus';
  if (g.includes('r&b') || g.includes('soul') || g.includes('acoustic')) return 'romantic';
  if (g.includes('emo') || g.includes('sad') || g.includes('shoegaze')) return 'melancholy';
  if ((g.includes('dance') || g.includes('house') || g.includes('pop')) && bpm > 115) return 'party';
  return null;
}

async function calculateMood(userId: string) {
  const history = await db.listenHistory.findMany({
    where: { userId, listenedAt: { gte: subHours(new Date(), 2) }, secondsPlayed: { gte: 30 } },
    include: { track: { select: { genre: true, bpm: true } } },
  });

  if (history.length < 3) return;

  const scores: Record<string, number> = {};
  for (const { track } of history) {
    const mood = mapToMood(track.genre ?? '', track.bpm ?? 100);
    if (mood) scores[mood] = (scores[mood] ?? 0) + 1;
  }

  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
  if (!sorted.length) return;

  const [topMood, count] = sorted[0];
  await db.userMood.upsert({
    where: { userId },
    update: { mood: topMood, confidence: count / history.length },
    create: { userId, mood: topMood, confidence: count / history.length },
  });
  await redis.setex(`user:${userId}:mood`, 1800, topMood);
}

new Worker('mood-cron', async () => {
  const activeUsers = await redis.keys('user:*:now_playing');
  const userIds = activeUsers.map(k => k.split(':')[1]);
  await Promise.all(userIds.map(calculateMood));
  console.log(`Mood calculated for ${userIds.length} users`);
}, { connection: redis });

console.log('Mood cron worker started');
