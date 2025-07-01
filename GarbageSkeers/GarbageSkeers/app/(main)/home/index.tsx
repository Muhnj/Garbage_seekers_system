import ContentCard from '@/components/card';
import LastPickupCard from '@/components/LastPickupCard';
import { db } from '@/firebase/firebase';
import { useAuthStore } from '@/stores/useAuthStore';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';


export default function ResidentHomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();
  const router = useRouter();
  const currentHour = new Date().getHours();
  const [activeTab, setActiveTab] = useState('Awareness Content');
  const [residentData, setResidentData] = useState(user);


  useEffect(() => {
    let unsubscribe: () => void;

    const fetchResidentDataRealtime = async () => {
      if (user) {
        try {
          const residentRef = doc(db, 'users', user.id);

          unsubscribe = onSnapshot(residentRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              setResidentData(data);
              //useAuthStore.getState().setProfile(data); // Update Zustand store
              console.log("Current resident data:", data);
            } else {
              Toast.show({
                type: 'error',
                text1: 'Something went wrong!',
                text2: 'Make sure your connected to internet please.',
              });
            }
          });

        } catch (error) {
          console.error('Error setting up realtime listener:', error);
          Toast.show({
            type: 'error',
            text1: 'Connection Error',
            text2: 'Could not establish realtime connection',
          });
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

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate network refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getGreeting = () => {
    if (currentHour < 12) return `Good morning ${residentData.firstName} !`;
    if (currentHour < 18) return `Good afternoon ${residentData.firstName} !`;
    return `Good evening ${residentData.firstName} !`;
  };

  const quickActions = [
    {
      id: 'schedule',
      title: 'Schedule Pickup',
      icon: 'calendar-check',
      color: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      action: () => router.push('/collectors/display'),
    },
    {
      id: 'report',
      title: 'Report Issue',
      icon: 'report',
      color: 'bg-amber-100',
      iconColor: 'text-amber-600',
      action: () => router.push('/(main)/home/report'),
    },
    {
      id: 'maps',
      title: 'Visit the Map',
      icon: 'map',
      color: 'bg-blue-100',
      iconColor: 'text-blue-600',
      action: () => router.push('/(main)/collectors/display'),
    },
    {
      id: 'rewards',
      title: 'My Rewards',
      icon: 'gift',
      color: 'bg-purple-100',
      iconColor: 'text-purple-600',
      action: () => router.push('/(main)/profile/rewards'),
    },
  ];

  return (
    <SafeAreaView>
      <ScrollView
        className="bg-gray-50"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header with Greeting */}
        <View className="pt-16 pb-6 px-6 bg-emerald-600">
          <Text className="text-white text-2xl">{getGreeting()}</Text>
          <Text className="text-white text-2xl font-bold mt-1">
            {'Resident'}
          </Text>

          {/* Eco Points Badge */}
          <View className="flex-row items-center mt-4 bg-emerald-700 rounded-full px-4 py-2 self-start">
            <FontAwesome5 name="leaf" size={16} color="#fff" />
            <Text className="text-white font-medium ml-2">{residentData.echoPoints}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mt-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">Quick Actions</Text>
          <View className="flex-row flex-wrap justify-between">
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                onPress={action.action}
                className={`w-[48%] mb-4 p-4 rounded-xl ${action.color}`}
              >
                {
                   action.icon === "report" ?
                   <MaterialIcons
                     name={action.icon as any}
                     size={24}
                     className={action.iconColor}
                   />
                   :
                   <FontAwesome5
                     name={action.icon as any}
                     size={24}
                     className={action.iconColor}
                   />

              }
                <Text className="font-medium text-gray-800 mt-2">{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upcoming Pickup Card */}
        <LastPickupCard />

        {/* Tab Navigation */}
        <View className="flex-row mx-6 mt-6 border-b border-gray-200">
          <TouchableOpacity
            className={`pb-3 px-4 ${activeTab === 'Awareness Content' ? 'border-b-2 border-emerald-500' : ''}`}
            onPress={() => setActiveTab('Awareness Content')}
          >
            <Text className={`font-medium ${activeTab === 'Awareness Content' ? 'text-emerald-600' : 'text-gray-500'}`}>
              Awareness Content
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`pb-3 px-4 ${activeTab === 'events' ? 'border-b-2 border-emerald-500' : ''}`}
            onPress={() => setActiveTab('events')}
          >
            <Text className={`font-medium ${activeTab === 'events' ? 'text-emerald-600' : 'text-gray-500'}`}>
              Community Events
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View className="px-6 pb-8">
          {activeTab === 'Awareness Content' &&
          <ContentCard
            title="Waste Sorting Guide"
            description="Learn how to properly sort your waste for better recycling"
            actionText="View Guide"
            onAction={() => router.push('/education/sorting-guide')}
          />
         }

         {activeTab === 'events' &&
         <Text className="w-full p-16 text-center">No community events available !</Text>
        }
        </View>


      </ScrollView>
    </SafeAreaView>
  );
}
