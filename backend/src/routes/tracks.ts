import { Router } from 'express';
import multer from 'multer';
import { v4 as uuid } from 'uuid';
import { uploadToR2 } from '../lib/r2';
import { audioQueue } from '../lib/queue';
import { redis } from '../lib/redis';
import { supabase } from '../lib/supabase';
import { AuthRequest, authMiddleware } from '../middleware/auth';

export const tracksRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200 * 1024 * 1024 } });

const ALLOWED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/flac'];

// Browse / search tracks via Supabase RPC (no direct DB connection needed)
tracksRouter.get('/', async (req, res) => {
  const { q, genre, limit = '20', offset = '0' } = req.query as Record<string, string>;
  try {
    const { data, error } = await supabase.rpc('get_tracks', {
      search_q: q || null,
      genre_filter: genre || null,
      lim: parseInt(limit),
      off: parseInt(offset),
    });
    if (error) throw error;
    res.json(data ?? []);
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

  const { error } = await supabase.rpc('create_track', {
    p_id: trackId, p_user_id: req.userId, p_title: title, p_genre: genre
  });
  if (error) return res.status(500).json({ error: error.message });

  await audioQueue.add('process', { trackId, rawKey, userId: req.userId });
  res.json({ trackId, status: 'processing' });
});

tracksRouter.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.rpc('get_track', { track_id: req.params.id });
    if (error) throw error;
    if (!data?.length) return res.status(404).json({ error: 'Track not found' });
    res.json(data[0]);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

tracksRouter.post('/:id/play', authMiddleware, async (req: AuthRequest, res) => {
  const { id: trackId } = req.params;
  const { secondsPlayed = 0 } = req.body;
  const userId = req.userId!;

  await supabase.rpc('record_play', { p_user_id: userId, p_track_id: trackId, p_seconds: secondsPlayed });

  // Redis now_playing (optional — non-fatal)
  try {
    const privacyCached = await redis.get(`user:${userId}:privacy`);
    const privacy = privacyCached ? JSON.parse(privacyCached) : null;
    const { data: tracks } = await supabase.rpc('get_track', { track_id: trackId });
    const track = tracks?.[0];
    const nowPlaying = JSON.stringify({ trackId, title: track?.title, coverUrl: track?.cover_url, userId });
    await redis.setex(`user:${userId}:now_playing`, 90, nowPlaying);
    if (privacy?.nowPlayingVisibility !== 'nobody') {
      await supabase.channel(`feed:${userId}`).send({
        type: 'broadcast', event: 'now_playing',
        payload: { userId, trackId, title: track?.title }
      });
    }
  } catch (redisErr: any) {
    console.warn('[redis] now_playing update failed (non-fatal):', redisErr.message);
  }

  res.json({ ok: true });
});

tracksRouter.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const { data } = await supabase.rpc('get_track', { track_id: req.params.id });
  const track = data?.[0];
  if (!track || track.user_id !== req.userId) return res.status(403).json({ error: 'Forbidden' });
  await supabase.from('tracks').delete().eq('id', req.params.id);
  res.json({ ok: true });
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

  const { error: createErr } = await supabase.rpc('create_track', {
    p_id: trackId, p_user_id: req.userId, p_title: title, p_genre: genre || null
  });
  if (createErr) return res.status(500).json({ error: createErr.message });

  await audioQueue.add('process', { trackId, rawKey, userId: req.userId });
  res.json({ trackId, status: 'processing' });
});

tracksRouter.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.rpc('get_track', { track_id: req.params.id });
    if (error) throw error;
    if (!data?.length) return res.status(404).json({ error: 'Track not found' });
    res.json(data[0]);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

tracksRouter.post('/:id/play', authMiddleware, async (req: AuthRequest, res) => {
  const { id: trackId } = req.params;
  const { secondsPlayed = 0 } = req.body;
  const userId = req.userId!;

  await supabase.rpc('record_play', { p_user_id: userId, p_track_id: trackId, p_seconds: secondsPlayed });

  // Redis now_playing (optional — non-fatal)
  try {
    const privacyCached = await redis.get(`user:${userId}:privacy`);
    const privacy = privacyCached ? JSON.parse(privacyCached) : null;
    const { data: tracks } = await supabase.rpc('get_track', { track_id: trackId });
    const track = tracks?.[0];
    const nowPlaying = JSON.stringify({ trackId, title: track?.title, coverUrl: track?.cover_url, userId });
    await redis.setex(`user:${userId}:now_playing`, 90, nowPlaying);
    if (privacy?.nowPlayingVisibility !== 'nobody') {
      await supabase.channel(`feed:${userId}`).send({
        type: 'broadcast', event: 'now_playing',
        payload: { userId, trackId, title: track?.title }
      });
    }
  } catch (redisErr: any) {
    console.warn('[redis] now_playing update failed (non-fatal):', redisErr.message);
  }

  res.json({ ok: true });
});

tracksRouter.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const { data } = await supabase.rpc('get_track', { track_id: req.params.id });
  const track = data?.[0];
  if (!track || track.user_id !== req.userId) return res.status(403).json({ error: 'Forbidden' });
  await supabase.from('tracks').delete().eq('id', req.params.id);
  res.json({ ok: true });
});

