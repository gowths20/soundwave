import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Track } from '../types';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

export function TrackCard({ track }: { track: Track }) {
  const { currentTrack, isPlaying, togglePlay } = useAudioPlayer();
  const isActive = currentTrack?.id === track.id;

  return (
    <Pressable onPress={() => togglePlay(track)} style={styles.row}>
      <Image
        source={{ uri: track.coverUrl || 'https://picsum.photos/seed/' + track.id + '/48/48' }}
        style={styles.cover}
      />
      <View style={styles.info}>
        <Text style={[styles.title, isActive && styles.titleActive]} numberOfLines={1}>
          {track.title}
        </Text>
        {track.genre ? <Text style={styles.genre}>{track.genre}</Text> : null}
      </View>
      <Text style={styles.icon}>
        {isActive ? (isPlaying ? '⏸' : '▶') : '▶'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  cover: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#222' },
  info: { flex: 1 },
  title: { color: '#fff', fontWeight: '600', fontSize: 14 },
  titleActive: { color: '#FF5500' },
  genre: { color: '#71717a', fontSize: 12, marginTop: 2 },
  icon: { color: '#71717a', fontSize: 16, paddingHorizontal: 4 },
});
