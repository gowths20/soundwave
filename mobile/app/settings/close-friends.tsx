import { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator } from 'react-native';
import { api } from '../../lib/api';
import { UserProfile } from '../../types';

export default function CloseFriendsScreen() {
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/close-friends').then(data => {
      setFriends(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  if (loading) return <View className="flex-1 bg-black items-center justify-center"><ActivityIndicator color="#FF5500" /></View>;

  return (
    <View className="flex-1 bg-black px-4 pt-16">
      <Text className="text-white text-2xl font-bold mb-2">Close Friends</Text>
      <Text className="text-zinc-500 text-sm mb-6">They can see your private activity ({friends.length}/50)</Text>
      <FlatList
        data={friends}
        keyExtractor={f => f.id}
        renderItem={({ item }) => (
          <View className="flex-row items-center gap-3 py-3 border-b border-zinc-900">
            <Image source={{ uri: item.avatarUrl ?? 'https://via.placeholder.com/40' }} className="w-10 h-10 rounded-full" />
            <View>
              <Text className="text-white font-semibold">{item.displayName}</Text>
              <Text className="text-zinc-500 text-xs">@{item.username}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text className="text-zinc-500 text-center mt-20">No close friends yet</Text>}
      />
    </View>
  );
}
