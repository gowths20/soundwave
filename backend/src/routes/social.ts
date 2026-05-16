import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

export const socialRouter = Router();
const db = new PrismaClient();

socialRouter.post('/:userId', async (req: AuthRequest, res) => {
  await db.friendship.upsert({
    where: { followerId_followingId: { followerId: req.userId!, followingId: req.params.userId } },
    update: {},
    create: { followerId: req.userId!, followingId: req.params.userId },
  });
  res.json({ ok: true });
});

socialRouter.delete('/:userId', async (req: AuthRequest, res) => {
  await db.friendship.delete({
    where: { followerId_followingId: { followerId: req.userId!, followingId: req.params.userId } },
  });
  res.json({ ok: true });
});
