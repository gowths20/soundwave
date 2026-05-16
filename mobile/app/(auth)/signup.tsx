import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signup = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) return Alert.alert('Sign up failed', error.message);
    router.push('/(auth)/profile-setup');
  };

  return (
    <View className="flex-1 bg-black px-6 pt-20">
      <Text className="text-white text-3xl font-black mb-8">Create account</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="#666" keyboardType="email-address" autoCapitalize="none"
        className="bg-zinc-900 text-white rounded-xl px-4 py-4 mb-3" />
      <TextInput value={password} onChangeText={setPassword} placeholder="Password (min 8 chars)" placeholderTextColor="#666" secureTextEntry
        className="bg-zinc-900 text-white rounded-xl px-4 py-4 mb-6" />
      <Pressable onPress={signup} disabled={loading} className="bg-orange-500 rounded-xl py-4 items-center">
        {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Create Account</Text>}
      </Pressable>
    </View>
  );
}
