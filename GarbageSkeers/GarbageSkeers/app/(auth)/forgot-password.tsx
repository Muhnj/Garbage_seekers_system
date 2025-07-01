import { auth } from '@/firebase/firebase';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|icloud|yahoo)\.com$/;
    if (!emailRegex.test(email)) {
      setError('Please use Gmail, iCloud or Yahoo');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
      Toast.show({
        type: 'success',
        text1: 'Email Sent',
        text2: 'Check your inbox for password reset instructions',
      });
    } catch (err: any) {
      setError(err.message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.message || 'Failed to send reset email',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50 p-6"
    >
      <View className="flex-1 py-12">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900">Reset Password</Text>
          <Text className="text-gray-500 mt-2">
            {emailSent 
              ? 'Check your email for further instructions'
              : 'Enter your email to receive a reset link'}
          </Text>
        </View>

        {!emailSent ? (
          <>
            {/* Email Input */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-1">Email Address</Text>
              <View
                className={`flex-row items-center border rounded-lg px-4 py-3 ${error ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`}
              >
                <MaterialIcons
                  name="email"
                  size={20}
                  color={error ? '#ef4444' : '#9ca3af'}
                  className="mr-3"
                />
                <TextInput
                  className="flex-1 text-gray-800"
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {error && (
                <Text className="text-red-500 text-xs mt-1">{error}</Text>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleResetPassword}
              disabled={loading}
              className={`py-3 rounded-lg ${loading ? 'bg-emerald-400' : 'bg-emerald-500'}`}
            >
              <Text className="text-white font-medium text-center">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Success State */}
            <View className="items-center mb-6">
              <MaterialIcons
                name="check-circle"
                size={60}
                color="#10B981"
                className="mb-4"
              />
              <Text className="text-lg text-center text-gray-700">
                Password reset email sent to {email}
              </Text>
            </View>

            {/* Back to Login */}
            <TouchableOpacity
              onPress={() => router.replace('/(auth)/login')}
              className="py-3 rounded-lg border border-emerald-500"
            >
              <Text className="text-emerald-500 font-medium text-center">
                Back to Login
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Login Link */}
        <View className="mt-6 flex-row justify-center">
          <Text className="text-gray-500">Remember your password? </Text>
          <Link href="/(auth)/login" className="text-emerald-600 font-medium">
            Sign in
          </Link>
        </View>
      </View>

      {/* Toast Component */}
      <Toast />
    </KeyboardAvoidingView>
  );
}