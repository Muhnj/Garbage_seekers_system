import { storage } from '@/firebase/firebase';
import { collectorManager } from '@/libs/resourceManagement';
import { useAuthStore } from '@/stores/useAuthStore';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

export default function EditProfileScreen() {
  const { user, setUser } = useAuthStore();
  const [collectorData, setCollectorData] = useState<any>({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [profilePhoto, setProfilePhoto] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    const fetchcollectorData = async () => {
      if (user) {
        try {
          const userData = await collectorManager.get(user.id);
          setCollectorData(userData);
          setFormData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            phone: userData.phone || '',
          });
          setProfilePhoto(userData.collectorPhoto || '');
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchcollectorData();
  }, [user]);

  const showImagePickerOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) handleTakePhoto();
          else if (buttonIndex === 2) handleSelectFromLibrary();
        }
      );
    } else {
      Alert.alert(
        'Choose Option',
        '',
        [
          { text: 'Take Photo', onPress: handleTakePhoto },
          { text: 'Choose from Library', onPress: handleSelectFromLibrary },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
    }
  };

  const handleTakePhoto = async () => {
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
      Toast.show({
        type: 'error',
        text1: 'Camera Error',
        text2: 'Failed to capture image',
      });
    }
  };

  const handleSelectFromLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Library access is needed to select photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadProfilePhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      Toast.show({
        type: 'error',
        text1: 'Library Error',
        text2: 'Failed to select image',
      });
    }
  };

  const uploadProfilePhoto = async (uri: string) => {
    setUploadingPhoto(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = uri.substring(uri.lastIndexOf('/') + 1);
      const storageRef = ref(storage, `profile-photos/${user?.id}_${filename}`);

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      setProfilePhoto(downloadURL);

      Toast.show({
        type: 'success',
        text1: 'Photo Updated',
        text2: 'Profile photo saved successfully',
      });
    } catch (error) {
      console.error('Upload error:', error);
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: 'Could not update profile photo',
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData = {
        firstName: formData.firstName || collectorData.firstName,
        lastName: formData.lastName || collectorData.lastName,
        phone: formData.phone || collectorData.phone,
        ...(profilePhoto && { collectorPhoto: profilePhoto }),
      };

      await collectorManager.updateResource(user.id, updateData);

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

        <View className="items-center mb-6">
          <TouchableOpacity onPress={showImagePickerOptions} disabled={uploadingPhoto}>
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} className="w-24 h-24 rounded-full" />
            ) : (
              <View className="bg-gray-200 p-6 rounded-full">
                <MaterialIcons name="account-circle" size={48} color="#9ca3af" />
              </View>
            )}
            <View className="absolute bottom-0 right-0 bg-emerald-500 p-2 rounded-full">
              <FontAwesome name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>
          <Text className="text-sm text-gray-500 mt-2">
            {uploadingPhoto ? 'Uploading...' : 'Tap to change photo'}
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">First Name</Text>
          <TextInput
            className="border border-gray-200 rounded-lg px-4 py-3"
            placeholder="Enter first name"
            value={formData.firstName}
            onChangeText={(text) => setFormData({ ...formData, firstName: text })}
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">Last Name</Text>
          <TextInput
            className="border border-gray-200 rounded-lg px-4 py-3"
            placeholder="Enter last name"
            value={formData.lastName}
            onChangeText={(text) => setFormData({ ...formData, lastName: text })}
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">Phone Number</Text>
          <TextInput
            className="border border-gray-200 rounded-lg px-4 py-3"
            placeholder="Enter phone number"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={loading || uploadingPhoto}
          className={`py-3 rounded-lg ${
            loading || uploadingPhoto ? 'bg-emerald-400' : 'bg-emerald-500'
          }`}
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
      <Toast />
    </ScrollView>
  );
}
