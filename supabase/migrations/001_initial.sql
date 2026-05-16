-- Users
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      TEXT UNIQUE NOT NULL,
  display_name  TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  avatar_url    TEXT,
  bio           TEXT,
  is_artist     BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Tracks
CREATE TABLE tracks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  genre            TEXT,
  bpm              INT,
  duration_seconds INT,
  audio_url        TEXT,
  waveform_url     TEXT,
  cover_url        TEXT,
  play_count       INT DEFAULT 0,
  status           TEXT DEFAULT 'processing',
  uploaded_at      TIMESTAMPTZ DEFAULT now()
);

-- Listen history
CREATE TABLE listen_history (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  track_id       UUID REFERENCES tracks(id) ON DELETE CASCADE,
  listened_at    TIMESTAMPTZ DEFAULT now(),
  seconds_played INT DEFAULT 0,
  completed      BOOLEAN DEFAULT false
);
CREATE INDEX idx_lh_user ON listen_history(user_id, listened_at DESC);

-- Likes
CREATE TABLE likes (
  user_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  track_id  UUID REFERENCES tracks(id) ON DELETE CASCADE,
  liked_at  TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, track_id)
);

-- Follow graph
CREATE TABLE friendships (
  follower_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
);

-- Close friends
CREATE TABLE close_friends (
  owner_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  added_at   TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (owner_id, friend_id)
);

-- Privacy settings
CREATE TYPE visibility AS ENUM ('everyone','friends','close_friends','nobody');

CREATE TABLE user_privacy (
  user_id                 UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  now_playing_visibility  visibility DEFAULT 'friends',
  liked_songs_visibility  visibility DEFAULT 'friends',
  history_visibility      visibility DEFAULT 'close_friends',
  mood_visibility         visibility DEFAULT 'close_friends',
  activity_visibility     visibility DEFAULT 'close_friends'
);

-- Mood cache
CREATE TABLE user_mood (
  user_id     UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  mood        TEXT,
  confidence  FLOAT,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Privacy gate function
CREATE OR REPLACE FUNCTION get_viewer_tier(p_owner_id UUID, p_viewer_id UUID)
RETURNS TEXT AS $$
BEGIN
  IF p_owner_id = p_viewer_id THEN RETURN 'self'; END IF;
  IF EXISTS (SELECT 1 FROM close_friends WHERE owner_id = p_owner_id AND friend_id = p_viewer_id)
    THEN RETURN 'close_friend'; END IF;
  IF EXISTS (SELECT 1 FROM friendships WHERE follower_id = p_viewer_id AND following_id = p_owner_id)
    AND EXISTS (SELECT 1 FROM friendships WHERE follower_id = p_owner_id AND following_id = p_viewer_id)
    THEN RETURN 'friend'; END IF;
  IF EXISTS (SELECT 1 FROM friendships WHERE follower_id = p_viewer_id AND following_id = p_owner_id)
    THEN RETURN 'follower'; END IF;
  RETURN 'public';
END;
$$ LANGUAGE plpgsql STABLE;

-- RLS
ALTER TABLE listen_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY lh_own ON listen_history FOR ALL USING (user_id = auth.uid());

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY likes_own ON likes FOR ALL USING (user_id = auth.uid());

ALTER TABLE user_privacy ENABLE ROW LEVEL SECURITY;
CREATE POLICY privacy_own ON user_privacy FOR ALL USING (user_id = auth.uid());

ALTER TABLE close_friends ENABLE ROW LEVEL SECURITY;
CREATE POLICY cf_own ON close_friends FOR ALL USING (owner_id = auth.uid());
