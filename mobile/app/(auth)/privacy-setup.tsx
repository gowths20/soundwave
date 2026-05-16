import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../lib/api';
import { ContentVisibility, UserPrivacy } from '../../types';
import { PrivacySelector } from '../../components/PrivacySelector';

export default function PrivacySetupScreen() {
  const router = useRouter();
  const [privacy, setPrivacy] = useState<UserPrivacy>({
    nowPlayingVisibility: 'friends',
    likedSongsVisibility: 'friends',
    historyVisibility: 'close_friends',
    moodVisibility: 'close_friends',
    activityVisibility: 'close_friends',
  });
  const [loading, setLoading] = useState(false);

  const set = (key: keyof UserPrivacy) => (v: ContentVisibility) => setPrivacy(p => ({ ...p, [key]: v }));

  const finish = async () => {
    setLoading(true);
    await api.put('/api/privacy', privacy);
    setLoading(false);
    router.replace('/(tabs)');
  };

  return (
    <ScrollView className="flex-1 bg-black px-6 pt-20">
      <Text className="text-zinc-400 text-sm mb-1">Step 4 of 4</Text>
      <Text className="text-white text-3xl font-black mb-2">Your privacy</Text>
      <Text className="text-zinc-400 mb-8">Set once. Never interrupted during playback.</Text>

      <PrivacySelector label="Now playing" value={privacy.nowPlayingVisibility} onChange={set('nowPlayingVisibility')} />
      <PrivacySelector label="Liked songs" value={privacy.likedSongsVisibility} onChange={set('likedSongsVisibility')} />
      <PrivacySelector label="Listen history" value={privacy.historyVisibility} onChange={set('historyVisibility')} />
      <PrivacySelector label="Mood" value={privacy.moodVisibility} onChange={set('moodVisibility')} />
      <PrivacySelector label="Activity status" value={privacy.activityVisibility} onChange={set('activityVisibility')} />

      <Pressable onPress={finish} disabled={loading} className="bg-orange-500 rounded-xl py-4 items-center mt-8 mb-12">
        {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Start Listening</Text>}
      </Pressable>
    </ScrollView>
  );
}
