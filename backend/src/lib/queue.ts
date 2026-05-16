import { Queue } from 'bullmq';
import { redis } from './redis';

export const audioQueue = new Queue('audio-processing', { connection: redis });
export const moodQueue = new Queue('mood-cron', { connection: redis });
