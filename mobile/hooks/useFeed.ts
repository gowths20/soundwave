import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';
import { FeedItem } from '../types';

export function useFeed() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await api.get('/api/feed');
    setFeed(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();

    const channel = supabase
      .channel('friends-feed')
      .on('broadcast', { event: 'now_playing' }, ({ payload }) => {
        setFeed(prev => {
          const idx = prev.findIndex(item => item.user.id === payload.userId);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], nowPlaying: payload };
            return updated;
          }
          return prev;
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [refresh]);

  return { feed, loading, refresh };
}
