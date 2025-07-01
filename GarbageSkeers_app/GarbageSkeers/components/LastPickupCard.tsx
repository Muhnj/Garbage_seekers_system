import { db } from '@/firebase/firebase';
import { useAuthStore } from '@/stores/useAuthStore';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface Pickup {
  id: string;
  collectorName: string;
  garbageType: string;
  sackCount: number;
  estimatedArrival?: string;
  status: string;
  createdAt: string;
  scheduledDate?: string;
}

export default function LastPickupCard() {
  const [lastPickup, setLastPickup] = useState<Pickup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const fetchLastPickup = async () => {
      try {
        // Replace 'current-user-id' with your actual user ID management
        const userId = user.id;

        const q = query(
          collection(db, 'pickups'),
          where('userId', '==', userId),
          where('status', '==', 'completed'),
          limit(1)
        );

        const querySnapshot = await getDocs(q);
        const sortedDocs = querySnapshot.docs.sort((a, b) =>
          new Date(b.data().createdAt).getTime() - new Date(a.data().createdAt).getTime()
        );

        if (sortedDocs.length > 0) {
          const doc = sortedDocs[0];
          const data = doc.data() as Omit<Pickup, 'id'>;
          setLastPickup({
            id: doc.id,
            ...data
          });
        }
      } catch (err) {
        console.error('Error fetching pickup:', err);
        setError('Failed to load pickup information');
      } finally {
        setLoading(false);
      }
    };

    fetchLastPickup();
  }, []);

  if (loading) {
    return (
      <View className="mx-6 mt-4 bg-white rounded-xl p-4 shadow-sm items-center justify-center h-40">
        <ActivityIndicator size="small" color="#059669" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="mx-6 mt-4 bg-white rounded-xl p-4 shadow-sm">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  if (!lastPickup) {
    return (
      <View className="mx-6 mt-4 bg-white rounded-xl p-4 shadow-sm">
        <Text className="text-gray-500">No pickup history found</Text>
      </View>
    );
  }

  const formatGarbageType = (type: string) => {
    switch (type) {
      case 'general':
        return 'General Waste';
      case 'recyclable':
        return 'Recyclable Waste';
      case 'hazardous':
        return 'Hazardous Waste';
      case 'organic':
        return 'Organic Waste';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'scheduled':
        return { text: 'Scheduled', color: 'text-blue-600' };
      case 'in-progress':
        return { text: 'In Progress', color: 'text-yellow-600' };
      case 'completed':
        return { text: 'Completed', color: 'text-emerald-600' };
      case 'cancelled':
        return { text: 'Cancelled', color: 'text-red-600' };
      default:
        return { text: status, color: 'text-gray-600' };
    }
  };

  const statusInfo = getStatusInfo(lastPickup.status);

  return (
    <View className="mx-6 mt-4 bg-white rounded-xl p-4 shadow-sm">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="font-bold text-gray-800">Last Pickup</Text>
        <Text className={`${statusInfo.color} font-medium`}>
          {statusInfo.text}
        </Text>
      </View>

      <View className="flex-row items-center">
        <View className="p-2 bg-emerald-100 rounded-full mr-3">
          <MaterialIcons
            name={lastPickup.status === 'completed' ? 'check-circle' : 'local-shipping'}
            size={20}
            color="#059669"
          />
        </View>
        <View className="flex-1">
          <Text className="font-medium">
            {formatGarbageType(lastPickup.garbageType)}
          </Text>
          <Text className="text-gray-500 text-sm">
            {lastPickup.sackCount} {lastPickup.sackCount === 1 ? 'bag' : 'bags'} • {formatDate(lastPickup.createdAt)}
          </Text>
          {lastPickup.collectorName && (
            <Text className="text-gray-500 text-sm mt-1">
              Collected by: {lastPickup.collectorName}
            </Text>
          )}
        </View>
      </View>


        <TouchableOpacity className="mt-4 py-2 border border-emerald-500 rounded-lg" onPress={() => router.push(`/pickups/${lastPickup.id}`)}>
          <Text className="text-emerald-600 text-center font-medium">
            View Details
          </Text>
        </TouchableOpacity>

    </View>
  );
}
