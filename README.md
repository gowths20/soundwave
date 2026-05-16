# Soundwave 🎵

> SoundCloud-inspired mobile app for independent artists with social listening, close friends privacy, and mood detection.

**Stack:** React Native (Expo) · Supabase · Cloudflare R2 · Node.js · TypeScript

## Project Structure

| Folder | Contents |
|---|---|
| `mobile/` | Expo React Native app |
| `backend/` | Node.js + Express API |
| `supabase/` | DB migrations & RLS policies |

## Quick Start

### Backend
```bash
cd backend
cp .env.example .env   # fill in your keys
npm install
npx prisma generate
npm run dev
```

### Mobile
```bash
cd mobile
npm install
npx expo start
```

## Features (MVP)
- 🎵 Upload & stream tracks (HLS via Cloudflare R2)
- 📊 Waveform scrubber (FFmpeg-generated peaks)
- 👥 Social feed — see what friends are listening to (live)
- 🔒 WhatsApp-style privacy — set once, never interrupted
- 😊 Mood detection from listen history (no ML, rule-based)
- 🎶 Background audio + lock screen controls

## Privacy Tiers
`Everyone → Friends → Close Friends → Nobody`

Each feature (now playing, history, mood, likes) has its own visibility setting, configured once during onboarding.
