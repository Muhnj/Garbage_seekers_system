import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '@/firebase/firebase';

const ReportScreen = () => {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // Request location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
        setLocationLoading(false);
        return;
      }

      try {
        // Get current location
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(location);

        // Reverse geocode to get address
        let geocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (geocode.length > 0) {
          const addr = `${geocode[0].name}, ${geocode[0].city}, ${geocode[0].region}, ${geocode[0].postalCode}`;
          setAddress(addr);
        }
      } catch (error) {
        console.error('Error getting location:', error);
        setLocationError('Failed to get your location. Please try again.');
      } finally {
        setLocationLoading(false);
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Sorry, we need camera permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const submitReport = async () => {
    if (!description) {
      Alert.alert('Error', 'Please describe the waste issue');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'We need your location to submit the report');
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = null;

      // Upload image if exists
      if (image) {
        const response = await fetch(image);
        const blob = await response.blob();
        const storageRef = ref(storage, `reports/${Date.now()}`);
        const snapshot = await uploadBytes(storageRef, blob);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // Save report to Firestore
      await addDoc(collection(db, 'reports'), {
        description,
        coordinates: [
          location.coords.latitude,
          location.coords.longitude
        ],
        address,
        imageUrl,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      Alert.alert('Success', 'Your report has been submitted successfully!');
      router.back();
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 p-4 bg-gray-50">
      <Text className="text-2xl font-bold mb-6 text-gray-800">Report Waste Issue</Text>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-1">Your Location</Text>
        {locationLoading ? (
          <View className="bg-white p-3 rounded-lg border border-gray-300">
            <ActivityIndicator size="small" color="#4B5563" />
            <Text className="text-gray-500 mt-1">Detecting your location...</Text>
          </View>
        ) : locationError ? (
          <View className="bg-red-50 p-3 rounded-lg border border-red-200">
            <Text className="text-red-600">{locationError}</Text>
          </View>
        ) : location ? (
          <View className="bg-white p-3 rounded-lg border border-gray-300">
            <Text className="text-gray-800">{address || 'Your current location'}</Text>
            <Text className="text-gray-500 text-xs mt-1">
              Coordinates: {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-1">Description*</Text>
        <TextInput
          className="bg-white p-3 rounded-lg border border-gray-300 h-32 text-align-top"
          placeholder="Describe the waste management issue..."
          multiline
          numberOfLines={5}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      <View className="mb-6">
        <Text className="text-sm font-medium text-gray-700 mb-2">Add Photo Evidence</Text>
        <View className="flex-row space-x-3">
          <TouchableOpacity
            className="bg-blue-100 p-3 rounded-lg flex-1 items-center"
            onPress={pickImage}
          >
            <Text className="text-blue-600 font-medium">Choose Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-green-100 p-3 rounded-lg flex-1 items-center"
            onPress={takePhoto}
          >
            <Text className="text-green-600 font-medium">Take Photo</Text>
          </TouchableOpacity>
        </View>

        {image && (
          <View className="mt-3">
            <Text className="text-sm text-gray-500 mb-1">Selected photo:</Text>
            <View className="w-full h-40 bg-gray-200 rounded-lg overflow-hidden">
              <Image
                source={{ uri: image }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity
        className="bg-green-600 p-4 rounded-lg items-center"
        onPress={submitReport}
        disabled={isSubmitting || !location}
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold">Submit Report</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ReportScreen;
