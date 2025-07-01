import '@/global.css';
import { registerPushToken } from '@/libs/registerPushToken';
import { collectorManager } from '@/libs/resourceManagement';
import { useAuthStore } from '@/stores/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Redirect, Tabs } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GuestLayout() {
  const {isLoggedIn} = useAuthStore();
  const {user} = useAuthStore();
  

  // Redirect to login if not logged in
  if (!isLoggedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  useEffect(() =>{
    async function getNotificationToken( ) {
      const token = await registerPushToken(user?.id, 'collectors');
      if (token) {
        useAuthStore.getState().setNotificationToken(token);
        console.log('Notification token set:', token);

        await collectorManager.updateResource(user.id, {
          pushToken: token,
        });
      }
    }
    getNotificationToken();
  }, [user?.id]);
  
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <Tabs
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: 'green',
          tabBarInactiveTintColor: 'gray',
          tabBarLabelStyle: { fontSize: 12 },
          headerShown: false,
        })}
      >
        <Tabs.Screen
          name="home"
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="collectors"
          options={{
            tabBarLabel: 'Collectors',
            tabBarIcon: ({ focused, color, size }) => (
              <FontAwesome5 name="users" size={size} color={color} />
            ),
            href: null, // Only show if logged in
          }}
        />
        <Tabs.Screen
          name="pickups"
          options={{
            tabBarLabel: 'Activities',
            tabBarIcon: ({ focused, color, size }) => (
              <MaterialIcons name="list" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ focused, color, size }) => (
              <FontAwesome5 name={focused ? 'user-alt' : 'user'} size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
