import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authRouter } from './routes/auth';
import { tracksRouter } from './routes/tracks';
import { feedRouter } from './routes/feed';
import { profileRouter } from './routes/profile';
import { socialRouter } from './routes/social';
import { privacyRouter } from './routes/privacy';
import { closeFriendsRouter } from './routes/closeFriends';
import { rateLimiter } from './middleware/rateLimit';
import { authMiddleware } from './middleware/auth';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// Simple health check — no DB, no Redis, always 200
app.get('/health', (_, res) => res.json({ ok: true, ts: Date.now() }));

app.use('/api/auth', authRouter);
app.use('/api/tracks', tracksRouter);  // auth applied per-route inside router
app.use('/api/feed', authMiddleware, feedRouter);
app.use('/api/profile', authMiddleware, profileRouter);
app.use('/api/follow', authMiddleware, socialRouter);
app.use('/api/privacy', authMiddleware, privacyRouter);
app.use('/api/close-friends', authMiddleware, closeFriendsRouter);

// Export for Vercel serverless
export default app;

// Start server when run directly (local dev / Railway)
if (require.main === module) {
  const PORT = process.env.PORT ?? 3000;
  app.listen(PORT, () => console.log(`Soundwave API running on :${PORT}`));
}
