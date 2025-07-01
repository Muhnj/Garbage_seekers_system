import { LoginWithEmail } from '@/libs/authService';
import { useAuthStore } from '@/stores/useAuthStore';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { role } = useAuthStore();
  
  useEffect(() =>{
    if(!role || loading){
      return;
    }

    if(role === 'resident'){
      router.replace('/(main)/home');
    } else if(role === 'collector'){
      router.replace('/(collector)/home');
    }

  }, [role, loading]);


  const handleLogin = async () => {
    setLoading(true);
    try {
      const userData = await LoginWithEmail(email, password);
      console.log("Passed test1")

      // if(role === 'resident'){
      //   console.log("Passed test2")
      //   router.replace('/(main)/home');
      // } else if(role === 'collector'){
      //   router.replace('/(collector)/home');
      // }


      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: `Welcome back, ${userData?.firstName || 'User'}!`,
      });

    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: `Password or email is incorrect. Please try again.`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 items-center px-6 py-16">
          <Image
            source={require('@/assets/images/icon.png')}
            className="w-24 h-24 mb-6"
            resizeMode="contain"
          />

          <Text className="text-2xl font-bold text-green-700 mb-6">
            Login to Your Account
          </Text>

          {/* Email Input */}
          <View className="w-full md:w-1/2 mb-4">
            <TextInput
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
            />
          </View>

          {/* Password Input with Toggle */}
          <View className="w-full md:w-1/2 mb-4 relative">
            <TextInput
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              className="border border-gray-300 rounded-xl px-4 py-3 text-base pr-10"
            />
            <Pressable
              className="absolute right-3 top-3"
              onPress={() => setShowPassword(!showPassword)}
            >
              <MaterialIcons 
                name={showPassword ? 'visibility-off' : 'visibility'} 
                size={20} 
                color="#666" 
              />
            </Pressable>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            className="w-full md:w-1/2 bg-green-600 py-3 rounded-xl mb-3"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-center text-white font-semibold text-base">
                Login
              </Text>
            )}
          </TouchableOpacity>

          {/* Links Container */}
          <View className="w-full md:w-1/2 items-center">
            <Link href="/(auth)/forgot-password" asChild>
              <Pressable>
                <Text className="text-green-700 underline mb-4">
                  Forgot password?
                </Text>
              </Pressable>
            </Link>

            <View className="flex-row">
              <Text className="text-gray-600">Don't have an account? </Text>
              <Link href="/(auth)/roleSelection" asChild>
                <Pressable>
                  <Text className="text-green-700 font-semibold">
                    Sign Up
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}