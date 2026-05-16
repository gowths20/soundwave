import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { redis } from '../lib/redis';
import { AuthRequest } from '../middleware/auth';

export const privacyRouter = Router();
const db = new PrismaClient();

privacyRouter.get('/', async (req: AuthRequest, res) => {
  const privacy = await db.userPrivacy.findUnique({ where: { userId: req.userId! } });
  res.json(privacy);
});

privacyRouter.put('/', async (req: AuthRequest, res) => {
  const { nowPlayingVisibility, likedSongsVisibility, historyVisibility, moodVisibility, activityVisibility } = req.body;
  const privacy = await db.userPrivacy.upsert({
    where: { userId: req.userId! },
    update: { nowPlayingVisibility, likedSongsVisibility, historyVisibility, moodVisibility, activityVisibility },
    create: { userId: req.userId!, nowPlayingVisibility, likedSongsVisibility, historyVisibility, moodVisibility, activityVisibility },
  });
  await redis.setex(`user:${req.userId}:privacy`, 300, JSON.stringify(privacy));
  res.json(privacy);
});
