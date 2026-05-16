import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { api } from '../../lib/api';
import { ContentVisibility, UserPrivacy } from '../../types';
import { PrivacySelector } from '../../components/PrivacySelector';

export default function PrivacySettingsScreen() {
  const [privacy, setPrivacy] = useState<UserPrivacy | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.get('/api/privacy').then(setPrivacy); }, []);

  const set = (key: keyof UserPrivacy) => (v: ContentVisibility) =>
    setPrivacy(p => p ? { ...p, [key]: v } : p);

  const save = async () => {
    setSaving(true);
    await api.put('/api/privacy', privacy);
    setSaving(false);
  };

  if (!privacy) return <View className="flex-1 bg-black items-center justify-center"><ActivityIndicator color="#FF5500" /></View>;

  return (
    <ScrollView className="flex-1 bg-black px-6 pt-16">
      <Text className="text-white text-2xl font-black mb-6">Privacy Settings</Text>
      <PrivacySelector label="Now playing" value={privacy.nowPlayingVisibility} onChange={set('nowPlayingVisibility')} />
      <PrivacySelector label="Liked songs" value={privacy.likedSongsVisibility} onChange={set('likedSongsVisibility')} />
      <PrivacySelector label="Listen history" value={privacy.historyVisibility} onChange={set('historyVisibility')} />
      <PrivacySelector label="Mood" value={privacy.moodVisibility} onChange={set('moodVisibility')} />
      <PrivacySelector label="Activity status" value={privacy.activityVisibility} onChange={set('activityVisibility')} />
      <Pressable onPress={save} disabled={saving} className="bg-orange-500 rounded-xl py-4 items-center mt-8 mb-12">
        {saving ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Save</Text>}
      </Pressable>
    </ScrollView>
  );
}
