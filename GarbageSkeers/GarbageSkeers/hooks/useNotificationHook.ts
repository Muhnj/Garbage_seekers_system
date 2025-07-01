import { db } from '@/firebase/firebase';
import { calculateDistance } from '@/libs/geoUtils';
import * as Notifications from 'expo-notifications';
import { collection, doc, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useRef } from 'react';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function useNotificationManager(userId: string, userType: 'resident' | 'collector') {
  // Track processed notifications to prevent duplicates
  const processedPickups = useRef<Set<string>>(new Set());
  const processedReviews = useRef<Set<string>>(new Set());
  const lastPrice = useRef<number | null>(null);

  // Initialize notifications
  useEffect(() => {
    const setupNotifications = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
    };
    setupNotifications();
  }, []);

  // Listen for pending pickups (Collector)
  useEffect(() => {
    if (userType !== 'collector') return;

    const pickupUnsubscribe = onSnapshot(
      query(
        collection(db, 'pickups'),
        where('collectorId', '==', userId),
        where('status', '==', 'pending')
      ),
      (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added' && !processedPickups.current.has(change.doc.id)) {
            processedPickups.current.add(change.doc.id);
            
            await sendPushNotification({
              title: 'New Pickup Request',
              body: 'You have a new garbage collection request pending',
              data: { type: 'new_pickup', pickupId: change.doc.id }
            });

            // Cleanup after 24 hours to prevent memory leaks
            setTimeout(() => {
              processedPickups.current.delete(change.doc.id);
            }, 24 * 60 * 60 * 1000);
          }
        });
      }
    );

    return () => pickupUnsubscribe();
  }, [userId, userType]);

  // Listen for pickup status changes (Resident)
  useEffect(() => {
    if (userType !== 'resident') return;

    const residentUnsubscribe = onSnapshot(
      query(
        collection(db, 'pickups'),
        where('residentId', '==', userId)
      ),
      (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          const newData = change.doc.data();
          const oldData = change.doc.metadata.hasPendingWrites ? null : change.doc.data();

          if (!processedPickups.current.has(change.doc.id)) {
            processedPickups.current.add(change.doc.id);

            if (newData.status === 'in-progress' && (!oldData || oldData.status !== 'approved')) {
              await sendPushNotification({
                title: 'Pickup Approved',
                body: `Your pickup has been approved by ${newData.collectorName}`,
                data: { type: 'pickup_approved', pickupId: change.doc.id }
              });
            }

            if (newData.status === 'completed' && (!oldData || oldData.status !== 'completed')) {
              await sendPushNotification({
                title: 'Pickup Completed',
                body: `Your pickup has been completed by ${newData.collectorName}`,
                data: { type: 'pickup_completed', pickupId: change.doc.id }
              });
            }

            setTimeout(() => {
              processedPickups.current.delete(change.doc.id);
            }, 24 * 60 * 60 * 1000);
          }
        });
      }
    );

    return () => residentUnsubscribe();
  }, [userId, userType]);

  // Listen for reviews (Collector)
  useEffect(() => {
    if (userType !== 'collector') return;

    const reviewUnsubscribe = onSnapshot(
      query(
        collection(db, 'reviews'),
        where('collectorId', '==', userId)
      ),
      (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added' && !processedReviews.current.has(change.doc.id)) {
            processedReviews.current.add(change.doc.id);
            const reviewData = change.doc.data();
            
            await sendPushNotification({
              title: 'New Review Received',
              body: `You received a ${reviewData.rating}★ review from ${reviewData.residentName}`,
              data: { type: 'new_review', reviewId: change.doc.id }
            });

            setTimeout(() => {
              processedReviews.current.delete(change.doc.id);
            }, 24 * 60 * 60 * 1000);
          }
        });
      }
    );

    return () => reviewUnsubscribe();
  }, [userId, userType]);

  // Listen for price changes (Residents near collector)
  useEffect(() => {
    if (userType !== 'collector') return;

    const priceUnsubscribe = onSnapshot(doc(db, 'collectors', userId), async (docSnap) => {
      const collectorData = docSnap.data();
      if (!collectorData) return;

      // Check if price decreased and we have a previous price
      if (lastPrice.current !== null && 
          collectorData.pricePerSack < lastPrice.current && 
          collectorData.lastLocation) {
        
        // Find residents within 1km
        const residentsQuery = query(collection(db, 'residents'));
        const residentsSnapshot = await getDocs(residentsQuery);
        
        const nearbyResidents = residentsSnapshot.docs.filter(doc => {
          const residentData = doc.data();
          return residentData.lastLocation && 
                 calculateDistance(collectorData.lastLocation, residentData.lastLocation) <= 1;
        });

        // Notify each nearby resident
        for (const residentDoc of nearbyResidents) {
          const residentData = residentDoc.data();
          if (residentData.notificationToken) {
            await sendPushNotification({
              to: residentData.notificationToken,
              title: 'Price Drop Nearby!',
              body: `${collectorData.firstName} lowered their price to UGX ${collectorData.pricePerSack} per sack`,
              data: { 
                type: 'price_drop', 
                collectorId: userId,
                newPrice: collectorData.pricePerSack 
              }
            });
          }
        }
      }

      // Update last price reference
      lastPrice.current = collectorData.pricePerSack;
    });

    return () => priceUnsubscribe();
  }, [userId, userType]);
}

// Helper function to send push notifications
async function sendPushNotification({
  title,
  body,
  data,
  to
}: {
  title: string;
  body: string;
  data?: any;
  to?: string;
}) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default'
      },
      trigger: null
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}