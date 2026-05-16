import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useFeed } from '../../hooks/useFeed';
import { FriendNowPlayingCard } from '../../components/FriendNowPlayingCard';

export default function HomeScreen() {
  const { feed, loading, refresh } = useFeed();

  return (
    <View className="flex-1 bg-black px-4 pt-16">
      <Text className="text-white text-2xl font-bold mb-6">Friends</Text>
      <FlatList
        data={feed}
        keyExtractor={(item) => item.user.id}
        renderItem={({ item }) => <FriendNowPlayingCard item={item} />}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#FF5500" />}
        ListEmptyComponent={
          <Text className="text-zinc-500 text-center mt-20">No friends listening right now</Text>
        }
      />
    </View>
  );
}
