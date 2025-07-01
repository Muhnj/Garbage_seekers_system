// utils/registerPushToken.ts
import { db } from '@/firebase/firebase'; // Adjust the import path as necessary
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { getExpoPushTokenAsync } from 'expo-notifications';
import { doc, updateDoc } from 'firebase/firestore';

export async function registerPushToken(userId: string, collectionName: string) {
  // Ensure that the device is a physical device and not a simulator/emulator
  if (!Device.isDevice) return;

  // Check and request notification permissions
  // This is necessary to ensure that the app can receive push notifications

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Push notification permissions not granted');
    return;
  }

  // Get the Expo push token
  const token = (await getExpoPushTokenAsync()).data;

  // Log the token for debugging purposes
  console.log('Expo Push Token:', token);

  // Update the Firestore document with the user's Expo push token
  await updateDoc(doc(db, collectionName, userId), {
    expoPushToken: token,
  });
}
