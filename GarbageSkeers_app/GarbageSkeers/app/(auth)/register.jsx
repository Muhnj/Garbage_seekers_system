import CollectorRegistration from '@/components/CollectorRegistration';
import ResidentRegistration from '@/components/ResidentRegistration';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
export default function Register() {
  const { role } = useLocalSearchParams();
  const { role: storedRole } = useAuthStore();

  // Use either the URL param or stored role
  const currentRole = role || storedRole;

  return (
    <View className="flex-1">
      {/* Role-specific registration form */}
      {currentRole === 'resident' && <ResidentRegistration />}
      {currentRole === 'collector' && <CollectorRegistration />}
      {currentRole === 'admin' && <AdminRegistration />}
    </View>
  );
}