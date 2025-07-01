import { useAuthStore } from '@/stores/useAuthStore';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RewardsScreen() {
  const { user } = useAuthStore();

  // Sample rewards data
  const ecoPoints = 1420;
  const level = Math.floor(ecoPoints / 500) + 1; // Every 500 points = new level
  const progress = (ecoPoints % 500) / 500 * 100;

  const availableRewards = [
    {
      id: '1',
      title: '10% Off Next Pickup',
      points: 300,
      icon: 'local-shipping',
      color: '#4CAF50',
    },
    {
      id: '2',
      title: 'Free Recycling Bin',
      points: 800,
      icon: 'delete',
      color: '#2196F3',
    },
    {
      id: '3',
      title: 'Community Leader Badge',
      points: 1200,
      icon: 'star',
      color: '#FFC107',
    },
    {
      id: '4',
      title: 'Annual Waste Audit',
      points: 2000,
      icon: 'assessment',
      color: '#9C27B0',
    },
  ];

  const redeemedRewards = [
    {
      id: 'r1',
      title: '5% Off Pickup',
      date: '2023-10-15',
      points: 150,
    },
    {
      id: 'r2',
      title: 'Reusable Shopping Bag',
      date: '2023-08-22',
      points: 400,
    },
  ];

  return (
    <SafeAreaView className='flex-1'>
      <ScrollView className="bg-gray-50 flex-1">
        {/* Header with Points Summary */}
        <View className="bg-emerald-600 p-6">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-white text-lg">Your Eco Points</Text>
              <Text className="text-white text-3xl font-bold mt-1">
                {ecoPoints.toLocaleString()}
              </Text>
            </View>
            <FontAwesome5 name="leaf" size={32} color="#A7F3D0" />
          </View>
          {/* Level Progress */}
          <View className="mt-6">
            <View className="flex-row justify-between mb-1">
              <Text className="text-emerald-100">Level {level}</Text>
              <Text className="text-emerald-100">{ecoPoints % 500}/500 to next level</Text>
            </View>
            <View className="h-3 bg-emerald-800 rounded-full overflow-hidden">
              <View
                className="h-full bg-emerald-100"
                style={{ width: `${progress}%` }}
              />
            </View>
          </View>
        </View>
        {/* How to Earn Points */}
        <View className="p-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">Earn More Points</Text>
          <View className="bg-white rounded-xl p-4 shadow-sm">
            {[
              { action: 'Schedule pickup', points: '+50 pts' },
              { action: 'On-time sorting', points: '+30 pts' },
              { action: 'Refer a friend', points: '+100 pts' },
              { action: 'Community event', points: '+75 pts' },
            ].map((item, index) => (
              <View
                key={index}
                className={`flex-row justify-between py-3 ${index < 3 ? 'border-b border-gray-100' : ''}`}
              >
                <Text className="text-gray-700">{item.action}</Text>
                <Text className="text-emerald-600 font-medium">{item.points}</Text>
              </View>
            ))}
          </View>
        </View>
        {/* Available Rewards */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">Available Rewards</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="space-x-4"
          >
            {availableRewards.map(reward => (
              <TouchableOpacity
                key={reward.id}
                onPress={() => router.push(`/rewards/${reward.id}`)}
                className="bg-white w-64 p-4 rounded-xl shadow-sm"
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mb-3"
                  style={{ backgroundColor: `${reward.color}20` }} // 20% opacity
                >
                  <MaterialIcons name={reward.icon as any} size={24} color={reward.color} />
                </View>
                <Text className="font-bold text-gray-900 mb-1">{reward.title}</Text>
                <View className="flex-row items-center">
                  <FontAwesome5 name="leaf" size={14} color="#059669" />
                  <Text className="text-emerald-600 ml-2">{reward.points} Eco Points</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {/* Redeemed Rewards */}
        <View className="px-6 mb-8">
          <Text className="text-lg font-bold text-gray-900 mb-4">Your Rewards</Text>
          <View className="bg-white rounded-xl p-4 shadow-sm">
            {redeemedRewards.length > 0 ? (
              redeemedRewards.map((reward, index) => (
                <View
                  key={reward.id}
                  className={`flex-row justify-between items-center py-3 ${index < redeemedRewards.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <View>
                    <Text className="text-gray-900 font-medium">{reward.title}</Text>
                    <Text className="text-gray-500 text-sm">{reward.date}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <FontAwesome5 name="leaf" size={12} color="#059669" />
                    <Text className="text-emerald-600 ml-1 text-sm">{reward.points} pts</Text>
                  </View>
                </View>
              ))
            ) : (
              <View className="py-8 items-center">
                <MaterialIcons name="redeem" size={40} color="#9CA3AF" />
                <Text className="text-gray-500 mt-2">No rewards redeemed yet</Text>
                <Text className="text-gray-400 text-sm">Earn points to unlock rewards</Text>
              </View>
            )}
          </View>
        </View>
        {/* Community Impact */}
        <View className="px-6 mb-8">
          <Text className="text-lg font-bold text-gray-900 mb-4">Your Impact</Text>
          <View className="bg-white rounded-xl p-6 shadow-sm">
            <View className="flex-row justify-between mb-6">
              <View className="items-center">
                <Text className="text-2xl font-bold text-emerald-600">42</Text>
                <Text className="text-gray-500 text-sm">Pickups</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-emerald-600">128kg</Text>
                <Text className="text-gray-500 text-sm">Recycled</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-emerald-600">3.2t</Text>
                <Text className="text-gray-500 text-sm">CO₂ Saved</Text>
              </View>
            </View>
            <TouchableOpacity className="border border-emerald-500 rounded-lg py-2">
              <Text className="text-emerald-600 text-center font-medium">View Full Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
