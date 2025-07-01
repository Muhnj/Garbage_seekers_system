import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { useState, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { userManager } from '@/libs/resourceManagement'

export default function EditProfileScreen() {
  const { user } = useAuthStore();
  console.table(user);
  const [residentData, setResidentData] = useState({})
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResidentData = async () => {
      if (user) {
        try {
          const userData = await userManager.get(user.id);
          setResidentData(userData);

        } catch (error) {
          console.error('Error fetching resident data:', error);
        }
      }
    };

    fetchResidentData();
  }, [user]);

  const handleSave = async () => {
    setLoading(true)
    try {
      const updateData = {
        firstName: formData.firstName || residentData.firstName,
        lastName: formData.lastName || residentData.lastName,
        phone: formData.phone || residentData.phone
      }

      await userManager.updateResource(user.id, updateData);

      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your changes have been saved successfully',
      });

      router.back();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: 'There was an error saving your profile',
      });
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="bg-gray-50 flex-1 p-6">
      <View className="bg-white rounded-lg p-6 shadow-sm">
        <Text className="text-lg font-bold text-gray-900 mb-6">Edit Profile</Text>

        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">First Name</Text>
          <TextInput
            className="border border-gray-200 rounded-lg px-4 py-3"
            placeholder={residentData.firstName}
            value={formData.firstName}
            onChangeText={(text) => setFormData({ ...formData, firstName: text })}
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">Last Name</Text>
          <TextInput
            className="border border-gray-200 rounded-lg px-4 py-3"
            placeholder={residentData.lastName}
            value={formData.lastName}
            onChangeText={(text) => setFormData({ ...formData, lastName: text })}
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">Phone Number</Text>
          <TextInput
            className="border border-gray-200 rounded-lg px-4 py-3"
            placeholder={residentData.phone}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className={`py-3 rounded-lg ${loading ? 'bg-emerald-400' : 'bg-emerald-500'}`}
        >
          <Text className="text-white font-medium text-center">
            {loading ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 py-3 border border-gray-300 rounded-lg"
        >
          <Text className="text-gray-700 font-medium text-center">Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
