import { db } from '@/firebase/firebase';
import { notification } from '@/libs/notifications';
import { collectorManager, pickupManager } from '@/libs/resourceManagement';
import { useAuthStore } from '@/stores/useAuthStore';
import { Picker } from '@react-native-picker/picker';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Linking, Pressable, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

notification

export default function CollectorPickupActivities() {
  const [pickups, setPickups] = useState<any[]>([]);
  const [filteredPickups, setFilteredPickups] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [resident, setResident] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  // Initialize notifications
  useEffect(() => {
    const setupNotifications = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
    };
    setupNotifications();
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, 'pickups'),
      where('collectorId', '==', user?.id)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const pickupList: any[] = [];
      querySnapshot.forEach((doc) => {
        pickupList.push({ id: doc.id, ...doc.data() });
      });
      
      const sortedPickups = pickupList.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      setPickups(sortedPickups);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id]);

  useEffect(() => {
    filterPickups();
  }, [pickups, statusFilter]);

  const filterPickups = () => {
    let results = [...pickups];
    if (statusFilter !== 'all') {
      results = results.filter(p => p.status === statusFilter);
    }
    setFilteredPickups(results);
  };

  
    const handleCall = async (phoneNumber: string) => {
  try {
    // Clean the phone number (remove any non-digit characters)
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    
    // Check if we have a valid number
    if (!cleanedNumber) {
      Alert.alert('Error', 'Invalid phone number');
      return;
    }

    const url = `tel:${cleanedNumber}`;
    
    // Check if the device can make phone calls
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Phone calls are not supported on this device');
        }
      } catch (error) {
        console.error('Error making phone call:', error);
        Alert.alert('Error', 'Failed to initiate phone call');
      }
    };


  const handleStatusChange = async (pickupId: string, newStatus: string) => {
    try {
      setLoading(true);
      // Update pickup status in Firestore
      const pickupRef = doc(db, 'pickups', pickupId);
      const pickup = pickups.find(p => p.id === pickupId);
      
      await updateDoc(pickupRef, { 
        status: newStatus,
        ...(newStatus === 'in-progress' && { startedAt: new Date().toISOString() }),
        ...(newStatus === 'completed' && { completedAt: new Date().toISOString() })
      });

      // Send appropriate notifications
      switch (newStatus) {
        case 'in-progress':
          await notification.sendToUser(
            pickup?.userId,
            'Garbage Pickup in Progress',
            `Your garbage pickup has been accepted by ${user?.firstName}`,
            {
              type: 'pickup_in_progress',
              screen: `/(main)/pickups/${pickupId}`,
              pickupId
            }
          );

          break;
        case 'completed':
          const collector = await collectorManager.get(user.id);
          await collectorManager.updateResource(user.id, {
            totalPickups: (collector?.totalPickups || 0) + 1,
            totalEarnings: (collector?.totalEarnings || 0) + pickup?.totalPrice
          });
          await pickupManager.updateResource(pickupId, {
            collectorId: user.id,
            collectorName: `${user?.firstName} ${user?.lastName}`,
            completedAt: new Date().toISOString(),
            status: 'completed'
          });
          await notification.sendToUser(
            pickup?.userId,
            'Garbage Pickup Completed',
            `Thanks for choosing us. Rate ${user?.firstName}`,
            {
              type: 'pickup_completed',
              screen: `/(main)/pickups/${pickupId}`,
              pickupId
            }
          );
          break;
        case 'cancelled':
          await notification.sendToUser(
            pickup?.userId,
            'Garbage Pickup has been cancelled',
            `Your garbage pickup has been cancelled, sorry for the inconvenience.`,
            {
              type: 'pickup_cancelled',
              screen: `/(main)/pickups/${pickupId}`,
              pickupId
            }
          );
          break;
      }

      Toast.show({
        type: 'success',
        text1: 'Status Updated',
        text2: `Pickup marked as ${newStatus.replace('-', ' ')}`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: 'Could not update pickup status',
      });
      console.error('Error updating pickup status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-400';
      case 'in-progress': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const renderActionButton = (pickup: any) => {
    switch (pickup?.status) {
      case 'pending':
        return (
          <View className="flex-row gap-4 text-xs mt-2">
            <Pressable
              onPress={() => handleCall(pickup?.contact)}
              className="bg-blue-600 px-2 py-2 rounded-lg"
            >
              <Text className="text-white font-bold text-xs">Call to confirm</Text>
            </Pressable>
            <Pressable
              onPress={() => handleStatusChange(pickup?.id, 'in-progress')}
              className="bg-green-600 px-2 py-2 rounded-lg"
            >
              <Text className="text-white font-bold text-xs">Accept</Text>
            </Pressable>
            <Pressable
              onPress={() => handleStatusChange(pickup?.id, 'cancelled')}
              className="bg-gray-400 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-bold text-xs">Reject</Text>
            </Pressable>
          </View>
        );
      case 'in-progress':
        return (
          <Pressable
            onPress={() => handleStatusChange(pickup?.id, 'completed')}
            className="bg-emerald-500 px-4 py-2 rounded-lg mt-2"
          >
            <Text className="text-white font-bold">Mark as Complete</Text>
          </Pressable>
        );
      case 'completed':
        return (
          <View className="mt-2">
            {pickup?.review ? (
              <View className="bg-yellow-50 p-2 rounded-lg border border-yellow-200">
                <Text className="font-bold">Client Review:</Text>
                <View className="flex flex-col">
                  <Text className='text-yellow-500 text-lg'>{'★'.repeat(pickup?.rating)}</Text>
                  <Text className="ml-1 text-gray-600">{pickup?.review || 'No comment'}</Text>
                </View>
              </View>
            ) : (
              <Text className="text-gray-500">No review yet</Text>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  if (loading && pickups.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 bg-gray-50">
      {/* Filter UI */}
      <View className="mb-4">
        <Text className="font-bold mb-1">Filter by Status</Text>
        <View className="bg-white rounded-md border border-gray-300">
          <Picker
            selectedValue={statusFilter}
            onValueChange={(value) => setStatusFilter(value)}
          >
            <Picker.Item label="All" value="all" />
            <Picker.Item label="Pending" value="pending" />
            <Picker.Item label="In Progress" value="in-progress" />
            <Picker.Item label="Completed" value="completed" />
            <Picker.Item label="Cancelled" value="cancelled" />
          </Picker>
        </View>
      </View>

      {/* List */}
      {filteredPickups.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">No pickups found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPickups}
          keyExtractor={(item) => item?.id}
          renderItem={({ item }) => (
            <Pressable className="bg-white rounded-lg p-4 mb-3 shadow-sm" onPress={() => router.push(`/(collector)/pickups/${item.id}`)} >
              <View className="flex-row justify-between items-center mb-2">
                <View className='flex '>
                <Text className="text-lg font-bold">Contact Person: {item?.contactPerson}</Text>
                <Text className="text-sm text-gray-500 font-light">Call Now: {item?.contact}</Text>
                <Text className="text-sm text-gray-500 font-light">Garge Type: {item?.garbageType} waste</Text>
                <Text className="text-sm text-gray-500 font-light">Sack Count: {item?.sackCount}</Text>
                <Text className="text-sm text-gray-500 font-light">Price: {item?.totalPrice}</Text>

                </View>
                <View className={`${getStatusColor(item?.status)} px-3 py-1 rounded-full`}>
                  <Text className="text-white text-xs font-bold capitalize">
                    {item?.status.replace('-', ' ')}
                  </Text>
                </View>
              </View>
              
              {renderActionButton(item)}
            </Pressable>
          )}
        />
      )}
      
      <Toast />
    </View>
  );
}