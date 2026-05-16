import 'dotenv/config';
import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { redis } from '../lib/redis';
import { downloadFromR2, uploadToR2, CDN_BASE } from '../lib/r2';
import ffmpeg from 'fluent-ffmpeg';
import { parseFile } from 'music-metadata';
import { readdir, readFile, rm } from 'fs/promises';
import { mkdirSync } from 'fs';
import path from 'path';

const db = new PrismaClient();

new Worker('audio-processing', async (job) => {
  const { trackId, rawKey } = job.data;
  const tmpDir = `${process.cwd()}/.worker-tmp/${trackId}`;
  mkdirSync(tmpDir, { recursive: true });

  const inputPath = `${tmpDir}/input.mp3`;
  await downloadFromR2(rawKey, inputPath);

  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .output(`${tmpDir}/stream.m3u8`)
      .outputOptions(['-codec:a aac', '-b:a 128k', '-hls_time 10', '-hls_playlist_type vod'])
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });

  const meta = await parseFile(inputPath);
  const duration = Math.floor(meta.format.duration ?? 0);
  const bpm = meta.common.bpm ?? null;

  const files = await readdir(tmpDir);
  await Promise.all(files.filter(f => f !== 'input.mp3').map(async (f) => {
    const buf = await readFile(path.join(tmpDir, f));
    const ct = f.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/MP2T';
    await uploadToR2(`tracks/${trackId}/${f}`, buf, ct);
  }));

  await db.track.update({
    where: { id: trackId },
    data: {
      audioUrl: `${CDN_BASE}/tracks/${trackId}/stream.m3u8`,
      durationSeconds: duration,
      bpm,
      status: 'ready',
    }
  });

  await rm(tmpDir, { recursive: true, force: true });
  console.log(`Track ${trackId} processed successfully`);
}, { connection: redis });

console.log('Audio processor worker started');
