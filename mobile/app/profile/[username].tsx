import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api } from '../../lib/api';
import { UserProfile } from '../../types';

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    api.get(`/api/profile/${username}`).then(setProfile);
  }, [username]);

  if (!profile) return <View className="flex-1 bg-black items-center justify-center"><ActivityIndicator color="#FF5500" /></View>;

  return (
    <ScrollView className="flex-1 bg-black px-4 pt-16">
      <Text className="text-white text-2xl font-bold mb-1">{profile.displayName}</Text>
      <Text className="text-zinc-500 mb-4">@{profile.username}</Text>
      {profile.bio && <Text className="text-zinc-300 mb-6">{profile.bio}</Text>}
      {profile.isArtist && (
        <View className="bg-orange-500/20 rounded-xl px-4 py-2 self-start">
          <Text className="text-orange-500 text-sm font-semibold">🎵 Artist</Text>
        </View>
      )}
    </ScrollView>
  );
}
