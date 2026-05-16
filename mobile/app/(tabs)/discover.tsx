import { useState } from 'react';
import { View, Text, TextInput, FlatList } from 'react-native';
import { api } from '../../lib/api';
import { TrackCard } from '../../components/TrackCard';
import { Track } from '../../types';

export default function DiscoverScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);

  const search = async (q: string) => {
    setQuery(q);
    if (q.length < 2) return setResults([]);
    const data = await api.get(`/api/tracks?q=${encodeURIComponent(q)}`);
    setResults(Array.isArray(data) ? data : []);
  };

  return (
    <View className="flex-1 bg-black px-4 pt-16">
      <Text className="text-white text-2xl font-bold mb-4">Discover</Text>
      <TextInput
        value={query} onChangeText={search}
        placeholder="Search tracks or artists…" placeholderTextColor="#666"
        className="bg-zinc-900 text-white rounded-xl px-4 py-3 mb-4"
      />
      <FlatList
        data={results}
        keyExtractor={t => t.id}
        renderItem={({ item }) => <TrackCard track={item} />}
        ListEmptyComponent={<Text className="text-zinc-500 text-center mt-20">Start typing to search</Text>}
      />
    </View>
  );
}
