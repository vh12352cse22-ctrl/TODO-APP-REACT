import React, { useEffect } from 'react';
import { View, Button, Text } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'YOUR_EXPO_CLIENT_ID_HERE',
  });

  const navigation = useNavigation();

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      AsyncStorage.setItem('userToken', authentication.accessToken);
      navigation.replace('Home');
    }
  }, [response]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Katomaran ToDo App</Text>
      <Button title="Login with Google" disabled={!request} onPress={() => promptAsync()} />
    </View>
  );
}