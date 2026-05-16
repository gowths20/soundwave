import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '../../lib/supabase';

export default function UploadScreen() {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
    if (!result.canceled) setFile(result.assets[0]);
  };

  const upload = async () => {
    if (!file || !title) return Alert.alert('Required', 'Please select a file and enter a title');
    setUploading(true);

    const { data: { session } } = await supabase.auth.getSession();
    const formData = new FormData();
    formData.append('file', { uri: file.uri, name: file.name, type: file.mimeType } as any);
    formData.append('title', title);
    formData.append('genre', genre);

    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/tracks/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session?.access_token}` },
      body: formData,
    });

    setUploading(false);
    if (res.ok) {
      Alert.alert('Uploaded!', 'Your track is being processed. Check back in a minute.');
      setTitle(''); setGenre(''); setFile(null);
    } else {
      Alert.alert('Error', 'Upload failed. Please try again.');
    }
  };

  return (
    <View className="flex-1 bg-black px-4 pt-16">
      <Text className="text-white text-2xl font-bold mb-6">Upload Track</Text>

      <Pressable onPress={pickFile} className="bg-zinc-900 rounded-xl p-4 mb-4 items-center border border-dashed border-zinc-700">
        <Text className="text-zinc-400">{file ? `✓ ${file.name}` : 'Tap to select audio file'}</Text>
      </Pressable>

      <TextInput value={title} onChangeText={setTitle} placeholder="Track title *" placeholderTextColor="#666"
        className="bg-zinc-900 text-white rounded-xl px-4 py-3 mb-3" />
      <TextInput value={genre} onChangeText={setGenre} placeholder="Genre (e.g. Hip-hop, Lo-fi)" placeholderTextColor="#666"
        className="bg-zinc-900 text-white rounded-xl px-4 py-3 mb-6" />

      <Pressable onPress={upload} disabled={uploading} className="bg-orange-500 rounded-xl py-4 items-center">
        {uploading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Upload</Text>}
      </Pressable>
    </View>
  );
}
