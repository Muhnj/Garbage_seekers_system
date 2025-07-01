import { auth } from '@/firebase/firebase';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import { verifyPasswordResetCode } from 'firebase/auth';
import { useEffect } from 'react';
import Toast from 'react-native-toast-message';

export default function PasswordResetHandler() {
  const router = useRouter();
  const params = useGlobalSearchParams();
  const { oobCode } = params;

  useEffect(() => {
    const handleReset = async () => {
      if (typeof oobCode === 'string') {
        try {
          // Verify the code is valid
          await verifyPasswordResetCode(auth, oobCode);
          router.push({
            pathname: '/(auth)/new-password',
            params: { oobCode },
          });
        } catch (error) {
          Toast.show({
            type: 'error',
            text1: 'Invalid Link',
            text2: 'This password reset link is invalid or has expired',
          });
          router.replace('/(auth)/forgot-password');
        }
      }
    };

    handleReset();
  }, [oobCode]);

  return null;
}