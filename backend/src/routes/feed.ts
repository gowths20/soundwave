import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { redis } from '../lib/redis';
import { AuthRequest } from '../middleware/auth';

export const feedRouter = Router();
const db = new PrismaClient();

function isAllowed(visibility: string, tier: string): boolean {
  if (visibility === 'everyone') return true;
  if (visibility === 'friends') return ['friend', 'close_friend', 'self'].includes(tier);
  if (visibility === 'close_friends') return ['close_friend', 'self'].includes(tier);
  return false;
}

feedRouter.get('/', async (req: AuthRequest, res) => {
  const viewerId = req.userId!;
  try {
    const following = await db.friendship.findMany({ where: { followerId: viewerId } });

    const items = await Promise.all(following.map(async ({ followingId }) => {
      try {
        const nowPlayingRaw = await redis.get(`user:${followingId}:now_playing`);
        if (!nowPlayingRaw) return null;

        const privacyRaw = await redis.get(`user:${followingId}:privacy`);
        const privacy = privacyRaw ? JSON.parse(privacyRaw) : { nowPlayingVisibility: 'friends', moodVisibility: 'close_friends' };

        const isMutual = await db.friendship.findUnique({ where: { followerId_followingId: { followerId: followingId, followingId: viewerId } } });
        const isCloseFriend = await db.closeFriend.findUnique({ where: { ownerId_friendId: { ownerId: followingId, friendId: viewerId } } });
        const tier = isCloseFriend ? 'close_friend' : isMutual ? 'friend' : 'follower';

        if (!isAllowed(privacy.nowPlayingVisibility, tier)) return null;

        const nowPlaying = JSON.parse(nowPlayingRaw);
        const mood = isAllowed(privacy.moodVisibility, tier) ? await redis.get(`user:${followingId}:mood`) : null;
        const user = await db.user.findUnique({ where: { id: followingId }, select: { id: true, displayName: true, avatarUrl: true } });

        return { user, nowPlaying, mood };
      } catch { return null; }
    }));

    res.json(items.filter(Boolean));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
