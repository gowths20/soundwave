import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { FeedItem } from '../types';
import { MoodChip } from './MoodChip';

export function FriendNowPlayingCard({ item }: { item: FeedItem }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/track/${item.nowPlaying.trackId}`)}
      className="bg-zinc-900 rounded-2xl p-4 flex-row items-center gap-3 mb-3"
    >
      <Image
        source={{ uri: item.user.avatarUrl ?? 'https://via.placeholder.com/40' }}
        className="w-10 h-10 rounded-full"
      />
      <View className="flex-1">
        <Text className="text-white font-semibold text-sm">{item.user.displayName}</Text>
        <Text className="text-zinc-400 text-xs" numberOfLines={1}>{item.nowPlaying.title}</Text>
      </View>
      {item.mood && <MoodChip mood={item.mood} />}
      {item.nowPlaying.coverUrl && (
        <Image source={{ uri: item.nowPlaying.coverUrl }} className="w-12 h-12 rounded-lg" />
      )}
    </Pressable>
  );
}
