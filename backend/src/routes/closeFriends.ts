import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

export const closeFriendsRouter = Router();
const db = new PrismaClient();

closeFriendsRouter.get('/', async (req: AuthRequest, res) => {
  const list = await db.closeFriend.findMany({
    where: { ownerId: req.userId! },
    include: { friend: { select: { id: true, displayName: true, avatarUrl: true, username: true } } },
  });
  res.json(list.map(cf => cf.friend));
});

closeFriendsRouter.post('/:userId', async (req: AuthRequest, res) => {
  const count = await db.closeFriend.count({ where: { ownerId: req.userId! } });
  if (count >= 50) return res.status(400).json({ error: 'Close friends list is full (max 50)' });

  await db.closeFriend.create({ data: { ownerId: req.userId!, friendId: req.params.userId } });
  res.json({ ok: true });
});

closeFriendsRouter.delete('/:userId', async (req: AuthRequest, res) => {
  await db.closeFriend.delete({ where: { ownerId_friendId: { ownerId: req.userId!, friendId: req.params.userId } } });
  res.json({ ok: true });
});
