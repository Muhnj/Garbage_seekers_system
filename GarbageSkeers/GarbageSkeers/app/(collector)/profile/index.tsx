import { db, storage } from '@/firebase/firebase';
import { useAuthStore } from '@/stores/useAuthStore';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

export default function CollectorProfileScreen() {
  const { user, setUser, clearAuth } = useAuthStore();
  const [collectorData, setCollectorData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  // Realtime data listener
  useEffect(() => {
    let unsubscribe: () => void;

    const fetchCollectorData = async () => {
      if (user?.id) {
        try {
          setLoading(true);
          const collectorRef = doc(db, 'collectors', user.id);

          unsubscribe = onSnapshot(collectorRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              setCollectorData(data);
              setEditData({
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
              });
            }
          });
        } catch (error) {
          console.error('Error fetching collector data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCollectorData();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.id]);

  const handleEditToggle = () => {
    setEditing(!editing);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const takeProfilePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera access is needed to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadProfilePhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const uploadProfilePhoto = async (uri: string) => {
    setUploading(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = uri.substring(uri.lastIndexOf('/') + 1);
      const storageRef = ref(storage, `profile-photos/${user?.id}_${filename}`);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update Firestore
      await updateDoc(doc(db, 'collectors', user?.id), {
        collectorPhoto: downloadURL
      });

      // Update local state
      setCollectorData((prev: any) => ({ ...prev, collectorPhoto: downloadURL }));
      
      Toast.show({
        type: 'success',
        text1: 'Profile Photo Updated',
      });
    } catch (error) {
      console.error('Upload error:', error);
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: 'Could not update profile photo',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, 'collectors', user?.id), {
        firstName: editData.firstName,
        lastName: editData.lastName,
        phone: editData.phone,
      });

      // Update Zustand store
      setUser({
        ...user,
        firstName: editData.firstName,
        lastName: editData.lastName,
      });

      setEditing(false);
      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
      });
    } catch (error) {
      console.error('Update error:', error);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
      });
    }
  };

  const handleLogout = async () => {
    try {
      await useAuthStore.getState().clearAuth();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading || !collectorData) {
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
          <TouchableOpacity 
            onPress={editing ? takeProfilePhoto : undefined}
            disabled={!editing || uploading}
          >
            <View className={`p-1 rounded-full ${editing ? 'bg-emerald-100' : ''}`}>
              {collectorData.collectorPhoto ? (
                <Image
                  source={{ uri: collectorData.collectorPhoto }}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <View className="bg-emerald-100 p-4 rounded-full">
                  <MaterialIcons 
                    name="account-circle" 
                    size={48} 
                    color="#059669" 
                  />
                </View>
              )}
              {editing && (
                <View className="absolute bottom-0 right-0 bg-emerald-500 p-1 rounded-full">
                  <FontAwesome name="camera" size={16} color="white" />
                </View>
              )}
            </View>
          </TouchableOpacity>

          <View className="ml-4">
            {editing ? (
              <>
                <TextInput
                  className="text-white text-xl font-bold bg-emerald-700 px-2 py-1 rounded"
                  value={editData.firstName}
                  onChangeText={(text) => handleInputChange('firstName', text)}
                />
                <TextInput
                  className="text-white text-xl font-bold bg-emerald-700 px-2 py-1 rounded mt-1"
                  value={editData.lastName}
                  onChangeText={(text) => handleInputChange('lastName', text)}
                />
              </>
            ) : (
              <>
                <Text className="text-white text-xl font-bold">
                  {collectorData.firstName} {collectorData.lastName}
                </Text>
                <Text className="text-emerald-100">{collectorData.email}</Text>
              </>
            )}
          </View>
        </View>

        {/* Verification Badge */}
        <View className="mt-4 ">
          <View className={`inline-flex px-3 py-1 rounded-full ${collectorData.status === 'verified' ? 'bg-emerald-100 w-36' : 'bg-amber-100'}`}>
            <Text className={`text-sm font-medium ${collectorData.status === 'verified' ? 'text-emerald-800' : 'text-amber-800'}`}>
              {collectorData.status === 'verified' ? 'Verified Collector' : 'Pending Verification'}
            </Text>
          </View>
          {collectorData.hasCompany && (
            <View className="inline-flex px-3 py-1 rounded-full bg-blue-100 ml-2">
              <Text className="text-sm font-medium text-blue-800">
                Company Collector
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Profile Details */}
      <View className="p-6">
        <View className="bg-white rounded-lg p-6 shadow-sm">
          {/* Personal Information */}
          <View className="mb-6">
            <Text className="text-sm text-emerald-600">Personal Information</Text>
            <View className="mt-4 space-y-4">
              <View className="flex-row justify-between items-center border-b border-gray-100 pb-3">
                <Text className="text-gray-500">First Name</Text>
                {editing ? (
                  <TextInput
                    className="font-medium text-right"
                    value={editData.firstName}
                    onChangeText={(text) => handleInputChange('firstName', text)}
                  />
                ) : (
                  <Text className="font-medium">{collectorData.firstName}</Text>
                )}
              </View>
              <View className="flex-row justify-between items-center border-b border-gray-100 pb-3">
                <Text className="text-gray-500">Last Name</Text>
                {editing ? (
                  <TextInput
                    className="font-medium text-right"
                    value={editData.lastName}
                    onChangeText={(text) => handleInputChange('lastName', text)}
                  />
                ) : (
                  <Text className="font-medium">{collectorData.lastName}</Text>
                )}
              </View>
              <View className="flex-row justify-between items-center border-b border-gray-100 pb-3">
                <Text className="text-gray-500">Email</Text>
                <Text className="font-medium">{collectorData.email}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-500">Phone</Text>
                {editing ? (
                  <TextInput
                    className="font-medium text-right"
                    value={editData.phone}
                    onChangeText={(text) => handleInputChange('phone', text)}
                    keyboardType="phone-pad"
                  />
                ) : (
                  <Text className="font-medium">{collectorData.phone || 'Not provided'}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Collector Specific Information */}
          <View className="mt-6 mb-6">
            <Text className="text-emerald-600 text-sm">Collector Details</Text>
            <View className="mt-4 space-y-4">
              <View className="flex-row justify-between items-center border-b border-gray-100 pb-3">
                <Text className="text-gray-500">NIN</Text>
                <Text className="font-medium">{collectorData.nin}</Text>
              </View>
              <View className="flex-row justify-between items-center border-b border-gray-100 pb-3">
                <Text className="text-gray-500">Collection Method</Text>
                <Text className="font-medium capitalize">
                  {collectorData.equipmentType?.replace('_', ' ')}
                </Text>
              </View>
              {collectorData.hasCompany && (
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-500">Company</Text>
                  <Text className="font-medium">{collectorData.companyName}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Edit/Save Buttons */}
          {collectorData.status === 'verified' ? (
            editing ? (
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={handleSave}
                  className="flex-1 flex-row items-center justify-center py-3 bg-emerald-500 rounded-lg"
                  disabled={uploading}
                >
                  <MaterialIcons name="save" size={18} color="white" />
                  <Text className="text-white font-medium ml-2">
                    {uploading ? 'Saving...' : 'Save Changes'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleEditToggle}
                  className="flex-1 flex-row items-center justify-center py-3 border border-gray-300 rounded-lg"
                >
                  <Text className="text-gray-700 font-medium">Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => router.push('/(collector)/profile/edit')}
                className="flex-row items-center justify-center py-3 border border-emerald-500 rounded-lg"
              >
                <MaterialIcons name="edit" size={18} color="#059669" />
                <Text className="text-emerald-600 font-medium ml-2">Edit Profile</Text>
              </TouchableOpacity>
            )
          ) : (
            <View className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <Text className="text-amber-800 text-center">
                Profile editing will be available after verification
              </Text>
            </View>
          )}
        </View>

        {/* Documents Section */}
        <View className="mt-6 bg-white rounded-lg p-6 shadow-sm">
          <Text className="text-emerald-600 text-sm">Documents</Text>
          <View className="mt-4 space-y-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-500">Rate this application</Text>
              {collectorData.lc1LetterPhoto ? (
                <TouchableOpacity >
                  <Text className="text-emerald-600 font-medium">Rate now</Text>
                </TouchableOpacity>
              ) : (
                <Text className="text-gray-400">Not submitted</Text>
              )}
            </View>
            {collectorData.hasCompany && (
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-500">Company Registration</Text>
                {collectorData.companyRegPhoto ? (
                  <TouchableOpacity onPress={() => router.push({
                    pathname: '/document-viewer',
                    params: { uri: collectorData.companyRegPhoto, title: 'Company Registration' }
                  })}>
                    <Text className="text-emerald-600 font-medium">View</Text>
                  </TouchableOpacity>
                ) : (
                  <Text className="text-gray-400">Not submitted</Text>
                )}
              </View>
            )}
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
      <Toast />
    </ScrollView>
  );
}