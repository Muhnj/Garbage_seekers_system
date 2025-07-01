// utils/notification.ts
import { db } from '@/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Expo push endpoint
const EXPO_API_URL = 'https://exp.host/--/api/v2/push/send';

type NotificationData = Record<string, any>;

/**
 * Sends a push notification using Expo.
 * @param expoToken - The recipient's Expo push token.
 * @param title - Notification title.
 * @param body - Notification body.
 * @param data - Optional data to include for in-app navigation.
 */
async function sendToExpo(
  expoToken: string,
  title: string,
  body: string,
  data: NotificationData = {}
) {
  const message = {
    to: expoToken,
    sound: 'default',
    title,
    body,
    data, // Custom payload
  };

  const res = await fetch(EXPO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  const responseData = await res.json();

  if (responseData?.data?.status !== 'ok') {
    throw new Error(responseData?.data?.message || 'Failed to send notification');
  }
}

/**
 * Notification Service
 */
export const notification = {
  /**
   * Sends a notification to any user in a given Firestore collection.
   * @param userId - The user ID in Firestore.
   * @param collection - Firestore collection name ('users', 'collector', etc.)
   * @param title - Notification title.
   * @param message - Notification message.
   * @param data - Optional data payload for handling when tapped.
   */
  async sendTo(userId: string, collection: string, title: string, message: string, data: NotificationData = {}) {
    try {
      const docSnap = await getDoc(doc(db, collection, userId));
      const user = docSnap.data();

      if (!user?.expoPushToken) {
        throw new Error('User does not have a push token');
      }

      await sendToExpo(user.expoPushToken, title, message, data);
      console.log(`Notification sent to ${userId} in "${collection}"`);
    } catch (err: any) {
      console.error('Notification Error:', err.message);
    }
  },

  /**
   * Shortcut to send a notification to a client (in 'users' collection).
   */
  async sendToUser(userId: string, title: string, message: string, data: NotificationData = {}) {
    return notification.sendTo(userId, 'users', title, message, data);
  },

  /**
   * Shortcut to send a notification to a collector (in 'collector' collection).
   */
  async sendToCollector(userId: string, title: string, message: string, data: NotificationData = {}) {
    return notification.sendTo(userId, 'collector', title, message, data);
  },

  /**
   * Shortcut to send a notification to a trainer (in 'trainers' collection).
   */
  async sendToTrainer(userId: string, title: string, message: string, data: NotificationData = {}) {
    return notification.sendTo(userId, 'trainers', title, message, data);
  },
};
