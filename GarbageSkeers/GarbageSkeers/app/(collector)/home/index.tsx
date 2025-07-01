import { db } from '@/firebase/firebase';
import { usePickupsData } from '@/hooks/usePickupData';
import { pickupManager } from '@/libs/resourceManagement';
import { useAuthStore } from '@/stores/useAuthStore';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

// Configure notifications handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function CollectorDashboard() {
  const { user } = useAuthStore();
  const pickups = usePickupsData();
  const [completedPickups, setCompletedPickups] = useState<any[]>([]);
  const [pendingPickups, setPendingPickups] = useState<any[]>([]);
  const [completedTodayPickups, setCompletedTodayPickups] = useState<any[]>([]);
  const [pendingTodayPickups, setPendingTodayPickups] = useState<any[]>([]);
  const [collectorData, setCollectorData] = useState<any>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [pricePerSack, setPricePerSack] = useState('');
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalEarningsToday, setTotalEarningsTaday] = useState(0);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string>('Fetching address...');
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  // Realtime data listener
  useEffect(() => {
    let unsubscribe: () => void;

    const fetchCollectorData = async () => {
      if (user?.id) {
        const collectorRef = doc(db, 'collectors', user.id);
        unsubscribe = onSnapshot(collectorRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setCollectorData(data);
            setIsAvailable(data?.isAvailable || false);
            setPricePerSack(data?.pricePerSack?.toString() || '');
          }
        });
      }
    };

    fetchCollectorData();
    return () => unsubscribe?.();
  }, [user?.id]);

  // Location tracking
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription;
    let isMounted = true;

    const fetchLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location access is required for this feature');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        if (isMounted) {
          setLocation(location);
          updateCollectorLocation(location);
          reverseGeocode(location.coords);
        }

        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 10000,
            distanceInterval: 10,
          },
          (newLocation) => {
            if (isMounted) {
              setLocation(newLocation);
              updateCollectorLocation(newLocation);
              reverseGeocode(newLocation.coords);
            }
          }
        );
      } catch (error) {
        console.error('Location error:', error);
      }
    };

    fetchLocation();
    return () => {
      isMounted = false;
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  // Reverse geocode coordinates to get address
  const reverseGeocode = async (coords: Location.LocationObjectCoords) => {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      if (addresses.length > 0) {
        const addr = addresses[0];
        const addressStr = `${addr.name || ''} ${addr.street || ''}, ${addr.city || ''}`.trim();
        setAddress(addressStr || 'Address not available');
      }
    } catch (error) {
      console.error('Reverse geocode error:', error);
      setAddress('Could not fetch address');
    }
  };

  // Update collector location in Firestore
  const updateCollectorLocation = async (newLocation: Location.LocationObject) => {
    try {
      await updateDoc(doc(db, 'collectors', user?.id), {
        lastLocation: {
          latitude: newLocation.coords.latitude,
          longitude: newLocation.coords.longitude,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Location update failed:', error);
    }
  };

  // Aggregate pickups data
  useEffect(() => {
  const fetchPickups = async () => {
    const pickData = await pickupManager.getAll();
    const data = pickData.filter(p => p.collectorId === user.id);

    // Get today's date in YYYY-MM-DD format
    const todayDateString = new Date().toISOString().split('T')[0];

    // Helper to check if a date string is today
    const isToday = (dateStr) => dateStr?.startsWith(todayDateString);

    // Filter pickups
    const completed = data.filter(p => p.status === 'completed');
    const pending = data.filter(p => p.status === 'pending');

    const completedToday = completed.filter(p => isToday(p.completedAt));
    const pendingToday = pending.filter(p => isToday(p.createdAt));

    // Earnings
    const earningsToday = completedToday.reduce((sum, p) => sum + (p?.totalPrice || 0), 0);
    const totalEarnings = collectorData.totalEarnings || 0;

    // Update state
    setTotalEarningsTaday(earningsToday);
    setTotalEarnings(totalEarnings);
    setCompletedPickups(completed.length);
    setPendingPickups(pending.length);
    setCompletedTodayPickups(completedToday.length);
    setPendingTodayPickups(pendingToday.length);
  };

  if (user?.id) {
    fetchPickups();
  }
}, [user.id, pickups]);


  // Availability reminder system
  useEffect(() => {
    let reminderInterval: NodeJS.Timeout;

    const scheduleReminder = async () => {
      if (!isAvailable) {
        await schedulePushNotification();
        reminderInterval = setInterval(async () => {
          await schedulePushNotification();
        }, 2 * 60 * 60 * 1000); // Every 2 hours
      }
      return () => clearInterval(reminderInterval);
    };

    scheduleReminder();
    return () => clearInterval(reminderInterval);
  }, [isAvailable]);

  const toggleAvailability = async () => {
    const newAvailability = !isAvailable;
    setIsAvailable(newAvailability);

    try {
      await updateDoc(doc(db, 'collectors', user?.id), {
        isAvailable: newAvailability,
      });

      // Cancel all reminders when becoming available
      if (newAvailability) {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }

      Toast.show({
        type: 'success',
        text1: newAvailability ? 'You are now available' : 'You are now unavailable',
      });
    } catch (error) {
      console.error('Availability update failed:', error);
      setIsAvailable(!newAvailability);
    }
  };

  const updatePrice = async () => {
    const price = parseFloat(pricePerSack);
    if (isNaN(price)) {
      Alert.alert('Invalid Price', 'Please enter a valid number');
      return;
    }

    try {
      await updateDoc(doc(db, 'collectors', user?.id), {
        pricePerSack: price,
      });

      Toast.show({
        type: 'success',
        text1: 'Price Updated',
        text2: `Your price per sack is now UGX ${price}`,
      });
    } catch (error) {
      console.error('Price update failed:', error);
    }
  };

  if (!collectorData) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className='flex-1'>
      <ScrollView className="bg-gray-50 flex-1 ">
        {/* Dashboard Header */}
        <View className="bg-emerald-600 p-6">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white text-xl font-bold">
                {collectorData.firstName} {collectorData.lastName}
              </Text>
              <Text className="text-emerald-100">
                {collectorData.hasCompany ? collectorData.companyName : 'Independent Collector'}
              </Text>
            </View>
            <View className={`px-3 py-1 rounded-full ${isAvailable ? 'bg-green-100' : 'bg-red-100'}`}>
              <Text className={`font-medium ${isAvailable ? 'text-green-800' : 'text-red-800'}`}>
                {isAvailable ? 'Available' : 'Unavailable'}
              </Text>
            </View>
          </View>
        </View>
        {/* Current Location Information */}
        <View className="p-6">
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-4">Your Current Location</Text>
            {location ? (
              <View className="space-y-3">
                <View className="flex-row items-center">
                  <MaterialIcons name="location-pin" size={20} color="#4CAF50" />
                  <Text className="ml-2 text-gray-700">
                    {address}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <MaterialIcons name="my-location" size={20} color="#4CAF50" />
                  <Text className="ml-2 text-gray-700">
                    Coordinates: {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <MaterialIcons name="precision-manufacturing" size={20} color="#4CAF50" />
                  <Text className="ml-2 text-gray-700">
                    Accuracy: {location.coords.accuracy.toFixed(2)} meters
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <MaterialIcons name="access-time" size={20} color="#4CAF50" />
                  <Text className="ml-2 text-gray-700">
                    Last updated: {new Date(location.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              </View>
            ) : (
              <View className="h-24 items-center justify-center">
                <Text>Fetching location...</Text>
              </View>
            )}
          </View>
        </View>
        {/* Availability Controls */}
        <View className="px-6">
          <View className="bg-white rounded-lg p-6 shadow-sm">
            <View className="flex-row items-center justify-between mb-6">
              <View>
                <Text className="text-lg font-bold text-gray-900">Work Availability</Text>
                <Text className="text-gray-500">
                  {isAvailable ? 'You will receive pickup requests' : 'You will NOT receive requests'}
                </Text>
              </View>
              <Switch
                value={isAvailable}
                onValueChange={toggleAvailability}
                trackColor={{ false: '#e5e7eb', true: '#10b981' }}
                thumbColor="#ffffff"
              />
            </View>
            {/* Price Setting */}
            <View>
              <Text className="text-lg font-bold text-gray-900 mb-2">Price Per Sack (UGX)</Text>
              <View className="flex-row items-center">
                <TextInput
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-3 mr-2"
                  placeholder="Enter price"
                  value={pricePerSack}
                  onChangeText={setPricePerSack}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  onPress={updatePrice}
                  className="bg-emerald-500 px-4 py-3 rounded-lg"
                >
                  <Text className="text-white font-medium">Update</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        {/* Today's Stats */}
        {/* <View className="p-6">
          <View className="bg-white rounded-lg p-6 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-4">Today's Stats</Text>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-2xl font-bold text-emerald-600">{completedTodayPickups}</Text>
                <Text className="text-gray-500">Completed</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-amber-600">{pendingTodayPickups}</Text>
                <Text className="text-gray-500">Pending</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-blue-600">UGX { totalEarnings }</Text>
                <Text className="text-gray-500">Earnings</Text>
              </View>
            </View>
          </View>
        </View> */}
        {/* General Stats */}
        <View className="p-6">
          <View className="bg-white rounded-lg p-6 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-4">General Stats</Text>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-2xl font-bold text-emerald-600">{collectorData?.totalPickups || 0}</Text>
                <Text className="text-gray-500">Completed</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-amber-600">{pendingPickups}</Text>
                <Text className="text-gray-500">Pending</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-blue-600">UGX {collectorData?.totalEarnings || 0}</Text>
                <Text className="text-gray-500">Earnings</Text>
              </View>
            </View>
          </View>
        </View>
        {/* Quick Actions */}
        <View className="p-6">
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-4">Quick Actions</Text>
            <View className="flex-row justify-between">
              <TouchableOpacity className="items-center p-3" onPress={() => router.push('/(collector)/pickups')}>
                <View className="bg-emerald-100 p-3 rounded-full mb-2">
                  <MaterialIcons name="assignment" size={24} color="#059669" />
                </View>
                <Text className="text-sm">Pickups</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity className="items-center p-3">
                <View className="bg-blue-100 p-3 rounded-full mb-2">
                  <MaterialIcons name="payment" size={24} color="#3b82f6" />
                </View>
                <Text className="text-sm">Payments</Text>
              </TouchableOpacity> */}
              <TouchableOpacity className="items-center p-3" onPress={() => router.push('/(collector)/pickups')}>
                <View className="bg-purple-100 p-3 rounded-full mb-2">
                  <MaterialIcons name="star" size={24} color="#8b5cf6" />
                </View>
                <Text className="text-sm">Ratings</Text>
              </TouchableOpacity>
              <TouchableOpacity className="items-center p-3" onPress={() => router.push('/(collector)/profile/edit')}>
                <View className="bg-amber-100 p-3 rounded-full mb-2">
                  <MaterialIcons name="settings" size={24} color="#f59e0b" />
                </View>
                <Text className="text-sm">Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <Toast />
      </ScrollView>
    </SafeAreaView>
  );
}

// Notification helper
async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Stay visible online!",
      body: 'Always make sure availability is on',
      sound: 'default',
      data: { type: 'availability_reminder' },
    },
    trigger: null, // Send immediately
  });
}