import { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { api } from '../../lib/api';
import { TrackCard } from '../../components/TrackCard';
import { Track } from '../../types';

export default function DiscoverScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all tracks on mount
  useEffect(() => {
    api.get('/api/tracks').then((data: any) => {
      setResults(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const search = async (q: string) => {
    setQuery(q);
    if (q.length < 2) {
      // Back to browse all
      api.get('/api/tracks').then((data: any) => setResults(Array.isArray(data) ? data : []));
      return;
    }
    const data = await api.get(`/api/tracks?q=${encodeURIComponent(q)}`);
    setResults(Array.isArray(data) ? data : []);
  };

  return (
    <View className="flex-1 bg-black px-4 pt-16">
      <Text className="text-white text-2xl font-bold mb-4">Discover</Text>
      <TextInput
        value={query} onChangeText={search}
        placeholder="Search tracks or genre…" placeholderTextColor="#666"
        className="bg-zinc-900 text-white rounded-xl px-4 py-3 mb-4"
      />
      {loading ? (
        <ActivityIndicator color="#FF5500" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={t => t.id}
          renderItem={({ item }) => <TrackCard track={item} />}
          ListEmptyComponent={<Text className="text-zinc-500 text-center mt-20">No tracks found</Text>}
        />
      )}
    </View>
  );
}
