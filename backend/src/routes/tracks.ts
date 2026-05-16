import { Router } from 'express';
import multer from 'multer';
import { v4 as uuid } from 'uuid';
import { PrismaClient } from '@prisma/client';
import { uploadToR2, CDN_BASE } from '../lib/r2';
import { audioQueue } from '../lib/queue';
import { redis } from '../lib/redis';
import { supabase } from '../lib/supabase';
import { AuthRequest, authMiddleware } from '../middleware/auth';

export const tracksRouter = Router();
const db = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200 * 1024 * 1024 } });

const ALLOWED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/flac'];

// Browse all tracks (latest first, optional genre filter)
tracksRouter.get('/', async (req, res) => {
  const { q, genre, limit = '20', offset = '0' } = req.query as Record<string, string>;
  try {
    const where: any = { status: 'ready' };
    if (genre) where.genre = genre;
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { genre: { contains: q, mode: 'insensitive' } },
      ];
    }
    const tracks = await db.track.findMany({
      where,
      orderBy: { uploadedAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
      include: { user: { select: { id: true, displayName: true, avatarUrl: true, username: true } } },
    });
    res.json(tracks);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

tracksRouter.post('/upload', authMiddleware, upload.fields([{ name: 'file' }, { name: 'cover' }]), async (req: AuthRequest, res) => {
  const files = req.files as Record<string, Express.Multer.File[]>;
  const audioFile = files['file']?.[0];
  if (!audioFile || !ALLOWED_TYPES.includes(audioFile.mimetype)) {
    return res.status(400).json({ error: 'Invalid audio file. Must be MP3, WAV, or FLAC under 200MB.' });
  }

  const { title, genre } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const trackId = uuid();
  const ext = audioFile.originalname.split('.').pop();
  const rawKey = `raw/${req.userId}/${trackId}/original.${ext}`;

  await uploadToR2(rawKey, audioFile.buffer, audioFile.mimetype);

  const track = await db.track.create({
    data: { id: trackId, userId: req.userId!, title, genre, status: 'processing' }
  });

  await audioQueue.add('process', { trackId, rawKey, userId: req.userId });

  res.json({ trackId: track.id, status: 'processing' });
});

tracksRouter.get('/:id', async (req, res) => {
  const track = await db.track.findUnique({ where: { id: req.params.id } });
  if (!track) return res.status(404).json({ error: 'Track not found' });
  res.json(track);
});

tracksRouter.post('/:id/play', authMiddleware, async (req: AuthRequest, res) => {
  const { id: trackId } = req.params;
  const { secondsPlayed = 0 } = req.body;
  const userId = req.userId!;

  await db.listenHistory.create({ data: { userId, trackId, secondsPlayed, completed: secondsPlayed > 30 } });
  await db.track.update({ where: { id: trackId }, data: { playCount: { increment: 1 } } });

  const privacyCached = await redis.get(`user:${userId}:privacy`);
  const privacy = privacyCached ? JSON.parse(privacyCached) : null;

  const track = await db.track.findUnique({ where: { id: trackId }, select: { title: true, coverUrl: true } });
  const nowPlaying = JSON.stringify({ trackId, title: track?.title, coverUrl: track?.coverUrl, userId });
  await redis.setex(`user:${userId}:now_playing`, 90, nowPlaying);

  if (privacy?.nowPlayingVisibility !== 'nobody') {
    await supabase.channel(`feed:${userId}`).send({
      type: 'broadcast', event: 'now_playing',
      payload: { userId, trackId, title: track?.title }
    });
  }

  res.json({ ok: true });
});

tracksRouter.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const track = await db.track.findUnique({ where: { id: req.params.id } });
  if (!track || track.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });
  await db.track.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});
