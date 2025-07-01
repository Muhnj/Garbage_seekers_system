import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const roles = [
  {
    id: 'resident',
    title: 'Resident',
    description: 'Schedule waste pickups and manage your disposal',
    icon: 'home-account',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-500'
  },
  {
    id: 'collector',
    title: 'Collector',
    description: 'Manage pickups and track your routes',
    icon: 'truck-delivery',
    color: 'bg-blue-500',
    textColor: 'text-blue-500'
  },
  // {
  //   id: 'admin',
  //   title: 'Municipality',
  //   description: 'Monitor waste management operations',
  //   icon: 'office-building',
  //   color: 'bg-purple-500',
  //   textColor: 'text-purple-500'
  // }
];

export default function RoleSelection() {
  const { top, bottom } = useSafeAreaInsets();
  

  const handleSelectRole = (roleId: string) => {
    router.push(`/(auth)/register?role=${roleId}`);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <Animated.View 
        entering={FadeInUp.delay(200).springify()}
        style={{ paddingTop: top + 20 }}
        className="px-6 mb-8"
      >
        <Text className="text-3xl font-bold text-gray-900">Join as</Text>
        <Text className="text-lg text-gray-500 mt-2">
          Select your role to continue
        </Text>
      </Animated.View>

      {/* Role Cards */}
      <View className="px-6">
        {roles.map((role, index) => (
          <Animated.View
            key={role.id}
            entering={FadeInDown.delay(100 + index * 100).springify()}
          >
            <TouchableOpacity
              onPress={() => handleSelectRole(role.id)}
              className={`mb-4 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm`}
              style={{
                shadowColor: role.textColor.split('-')[1] + '500',
                shadowOpacity: 0.1,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 }
              }}
            >
              <View className="flex-row items-center">
                <View className={`p-3 rounded-lg ${role.color} mr-4`}>
                  <MaterialCommunityIcons 
                    name={role.icon} 
                    size={24} 
                    color="white" 
                  />
                </View>
                <View className="flex-1">
                  <Text className={`text-lg font-semibold ${role.textColor}`}>
                    {role.title}
                  </Text>
                  <Text className="text-gray-500 mt-1">
                    {role.description}
                  </Text>
                </View>
                <MaterialCommunityIcons 
                  name="chevron-right" 
                  size={24} 
                  className="text-gray-400" 
                />
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Footer */}
      <Animated.View 
        entering={FadeIn.delay(500)}
        style={{ paddingBottom: bottom + 20 }}
        className="absolute bottom-0 left-0 right-0 px-6"
      >
        <Text className="text-center text-gray-500">
          Already have an account?{' '}
          <Link href="/(auth)/login" className="text-emerald-600 font-medium">
            Sign in
          </Link>
        </Text>
      </Animated.View>
    </View>
  );
}