import { db } from '@/firebase/firebase';
import { useAuthStore } from '@/stores/useAuthStore';
import { Picker } from '@react-native-picker/picker';
import { Link } from 'expo-router';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

export default function PickupActivities() {
  const [pickups, setPickups] = useState<any[]>([]);
  const [filteredPickups, setFilteredPickups] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    const q = query(collection(db, 'pickups'), where('userId', '==', user.id));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const pickupList: any[] = [];
      querySnapshot.forEach((doc) => {
        pickupList.push({ id: doc.id, ...doc.data() });
      });
      setPickups(pickupList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    filterPickups();
  }, [pickups, statusFilter]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkAndCancelExpiredPickups();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [pickups]);

  const filterPickups = () => {
    let results = [...pickups];

    if (statusFilter !== 'all') {
      results = results.filter(p => p.status === statusFilter);
    }

    setFilteredPickups(results);
  };

  const checkAndCancelExpiredPickups = async () => {
    const now = new Date();

    for (const pickup of pickups) {
      if (pickup.status === 'pending') {
        const scheduledTime = new Date(pickup.createdAt);
        const timeDifference = (now.getTime() - scheduledTime.getTime()) / (1000 * 60 * 60); // Difference in hours

        if (timeDifference > 2) {
          // Update the status to 'cancelled' in Firestore
          const pickupRef = doc(db, 'pickups', pickup.id);
          await updateDoc(pickupRef, { status: 'cancelled' });

          // Update the local state
          setPickups(prevPickups =>
            prevPickups.map(p =>
              p.id === pickup.id ? { ...p, status: 'completed' } : p
            )
          );
        }
      }
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

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg">Loading pickups...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 bg-gray-50">

      {/* Filter UI */}
      <View className="mb-4">
        {/* Status Filter */}
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
        <Text className="text-center text-gray-600 mt-10">No pickups match your filters</Text>
      ) : (
        <FlatList
          data={filteredPickups}
          keyExtractor={(item) => item?.id}
          renderItem={({ item }) => (
            <Link href={`/pickups/${item?.id}`} asChild>
              <Pressable className="bg-white rounded-lg p-4 mb-3 shadow-lg border-slate-300 ">
                <View className="flex-row justify-between items-start mb-2">
                  <View>
                    <Text className="font-light text-gray-500 mb-4 text-sm">OrderID: #{item?.id}</Text>
                    <Text className="text-lg font-bold"><Text className='font-light'></Text> {item?.collectorName}</Text>
                    <Text className="text-lg font-bold"><Text className='font-light'>{item?.sackCount} {item?.sackCount > 1? 'Sacks' : 'Sack'} | {item?.garbageType} Waste</Text></Text>
                  </View>
                  <View className={`${getStatusColor(item?.status)} px-3 py-1 rounded-full`}>
                    <Text className="text-white text-xs font-bold capitalize">
                      {item?.status.replace('-', ' ')}
                    </Text>
                  </View>
                </View>
                <Text className="text-gray-600 mb-1">
                  Scheduled: {new Date(item?.createdAt).toLocaleString()}
                </Text>
                <Text className="text-lg font-semibold">
                  UGX {item?.totalPrice}
                </Text>
              </Pressable>
            </Link>
          )}
        />
      )}
    </View>
  );
}
