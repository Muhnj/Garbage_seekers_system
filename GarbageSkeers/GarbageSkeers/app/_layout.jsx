import { useAuthStore } from '@/stores/useAuthStore';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import '../global.css';


export default function AppLayout() {
  

  const { isLoggedIn, newUser, role, user} = useAuthStore();

  const router = useRouter();

  
  useEffect(() => {
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      
      if (data.type === 'new_pickup') {
        router.push(`/pickups/${data.pickupId}`);
      }
      if (data.type === 'pickup_in_progress') {
        router.push(`/pickups/${data.pickupId}`);
      }
      if (data.type === 'pickup_completed') {
        router.push(`/pickups/${data.pickupId}`);
      }
      // Add other navigation handlers
    });
    return () => responseListener.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={newUser}>
          <Stack.Screen name="(onBoard)" />
        </Stack.Protected>

        <Stack.Protected guard={isLoggedIn && role === 'resident'}>
          <Stack.Screen name="(main)" />
        </Stack.Protected>

        <Stack.Protected guard={isLoggedIn && role === 'collector'}>
          <Stack.Screen name="(collector)" />
        </Stack.Protected>
        
        <Stack.Protected>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
      <Toast />
    </GestureHandlerRootView>
  )
}
