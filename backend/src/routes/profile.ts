import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { redis } from '../lib/redis';
import { AuthRequest } from '../middleware/auth';

export const profileRouter = Router();
const db = new PrismaClient();

profileRouter.get('/:username', async (req: AuthRequest, res) => {
  const user = await db.user.findUnique({ where: { username: req.params.username } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, username: user.username, displayName: user.displayName, avatarUrl: user.avatarUrl, bio: user.bio, isArtist: user.isArtist });
});

profileRouter.get('/:username/mood', async (req: AuthRequest, res) => {
  const user = await db.user.findUnique({ where: { username: req.params.username } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const mood = await redis.get(`user:${user.id}:mood`) ?? (await db.userMood.findUnique({ where: { userId: user.id } }))?.mood;
  res.json({ mood });
});
