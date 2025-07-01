
import { useAuthStore } from '@/stores/useAuthStore';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { userManager } from '@/libs/resourceManagement';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/firebase/firebase'


export default function ProfileScreen() {
  const { user, clearAuth } = useAuthStore();
  const [residentData, setResidentData] = useState<any>(null);
  const [loading, setLoading] = useState(false);



useEffect(() => {
  let unsubscribe: () => void;

  const fetchResidentDataRealtime = async () => {
    if (user) {
      try {
        setLoading(true);
        const residentRef = doc(db, 'users', user.id);

        unsubscribe = onSnapshot(residentRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setResidentData(data);
            //useAuthStore.getState().setProfile(data); // Update Zustand store
            console.log("Current resident data:", data);
          } else {
            console.log("No resident document found");
          }
        });

      } catch (error) {
        console.error('Error setting up realtime listener:', error);
        Toast.show({
          type: 'error',
          text1: 'Connection Error',
          text2: 'Could not establish realtime connection',
        });
      } finally {
        setLoading(false);
      }
    } else {
      console.log("No user authenticated");
    }
  };

  fetchResidentDataRealtime();

  // Cleanup subscription on unmount
  return () => {
    if (unsubscribe) unsubscribe();
  };
}, [user?.id]); // Only re-run if user UID changes

  const handleLogout = async () => {
    try {
      await clearAuth();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="bg-gray-50 flex-1">
      {/* Profile Header */}
      <View className="bg-emerald-600 pt-12 p-6">
        <View className="flex-row items-center">
          <View className="bg-emerald-100 p-4 rounded-full">
            <MaterialIcons name="account-circle" size={40} color="#059669" />
          </View>
          <View className="ml-4">
            <Text className="text-white text-xl font-bold">
              {residentData?.firstName} {residentData?.lastName}
            </Text>
            <Text className="text-emerald-100">{residentData?.email}</Text>
          </View>
        </View>
      </View>

      {/* Profile Details */}
      <View className="p-6">
        <View className="bg-white rounded-lg p-6 shadow-sm">
          <View className="mb-6">
            <Text className="text-sm text-emerald-600">Personal Information</Text>
            <View className="mt-4 space-y-4">
              <View className="flex-row justify-between items-center border-b border-gray-100 pb-3">
                <Text className="text-gray-500">First Name</Text>
                <Text className="font-medium">{residentData?.firstName}</Text>
              </View>
              <View className="flex-row justify-between items-center border-b border-gray-100 pb-3">
                <Text className="text-gray-500">Last Name</Text>
                <Text className="font-medium">{residentData?.lastName}</Text>
              </View>
              <View className="flex-row justify-between items-center border-b border-gray-100 pb-3">
                <Text className="text-gray-500">Email</Text>
                <Text className="font-medium">{residentData?.email}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-500">Phone</Text>
                <Text className="font-medium">{residentData?.phone || 'Not provided'}</Text>
              </View>
            </View>
          </View>

          <View className="mt-6 mb-6">
            <Text className="text-emerald-600 text-sm">Account</Text>
            <View className="mt-4 space-y-4">
              <View className="flex-row justify-between items-center border-b border-gray-100 pb-3">
                <Text className="text-gray-500">Member Since</Text>
                <Text className="font-medium">
                  {new Date(residentData?.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-500">Echo Points</Text>
                <Text className="font-medium">{residentData?.echoPoints || ""}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/(main)/profile/edit')}
            className="flex-row items-center justify-center py-3 border border-emerald-500 rounded-lg mt-4"
          >
            <MaterialIcons name="edit" size={18} color="#059669" />
            <Text className="text-emerald-600 font-medium ml-2">Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Additional Sections */}
        <View className="mt-6 bg-white rounded-lg p-6 shadow-sm">
          <Text className="text-emerald-600 text-sm">Ratings</Text>
          <View className="mt-4 space-y-4">
            <TouchableOpacity className="flex-row justify-between items-center">
              <Text>Rate our App on play store</Text>
              <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="mt-8 flex-row items-center justify-center py-3 border border-red-500 rounded-lg"
        >
          <MaterialIcons name="logout" size={18} color="#ef4444" />
          <Text className="text-red-500 font-medium ml-2">Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
