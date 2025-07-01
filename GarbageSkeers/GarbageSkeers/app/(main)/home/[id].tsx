import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';

import StarRating from '@/components/Rating'; // You'll need to create this component
import { db } from '@/firebase/firebase';
import { pickupManager, collectorManager } from '@/libs/resourceManagement';
import { useAuthStore } from '@/stores/useAuthStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { arrayUnion,  onSnapshot } from 'firebase/firestore';


export default function PickupDetails() {
  const { id } = useLocalSearchParams();
  const [pickup, setPickup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const { user } = useAuthStore();
  const [collector, setCollector] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchPickup = async () => {
      try {
        const docRef = doc(db, 'pickups', id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPickup({ id: docSnap.id, ...docSnap.data() });
        } else {
          Alert.alert('Error', 'Pickup not found');
          router.back();
        }
      } catch (error) {
        console.error('Error fetching pickup:', error);
        Alert.alert('Error', 'Failed to load pickup details');
      } finally {
        setLoading(false);
      }
    };

    fetchPickup();
  }, [id]);

  const handleSubmitReview = async () => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    if (rating === 0) {
      Toast.show({
        type: 'error',
        text1: 'Please select a rating',
      });
      return;
    }

    if (!reviewText.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Please write a review',
        position: 'top'
      });
      return;
    }

    try {
      setSubmittingReview(true);
      const newReview = {
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        rating,
        text: reviewText,
        createdAt: new Date().toISOString()
      };

      await reviewManager.addResource(newReview);
      // Update collector's reviews and average rating
      const totalRatings = reviews.reduce((acc, review) => acc + review?.rating, 0);
      const averageRating = (totalRatings + rating) / (reviews.length + 1);

      //Upate the collector's document with the new review and average rating
      await collectorManager.updateResource(id, {
        reviews: arrayUnion(newReview),
        // averageRating: calculateNewAverage(rating),
        rating: averageRating,
      });

      Toast.show({
        type: 'success',
        text1: 'Review Submitted',
        text2: 'Thank you for your feedback!',
        position: 'bottom'
      });

      setReviewText('');
      setRating(0);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to submit review',
        text2: error.message,
        position: 'bottom'
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading || !pickup) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg">Loading pickup details...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 bg-gray-50">
      <Text className="text-2xl font-bold mb-4">Pickup Details</Text>

      <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <View className="flex-row justify-between mb-2">
          <Text className="text-lg font-bold">{pickup.collectorName}</Text>
          <View className={`${
            pickup.status === 'pending' ? 'bg-orange-400' :
            pickup.status === 'in-progress' ? 'bg-blue-500' :
            pickup.status === 'completed' ? 'bg-green-500' : 'bg-gray-500'
          } px-3 py-1 rounded-full`}>
            <Text className="text-white text-xs font-bold capitalize">
              {pickup.status.replace('-', ' ')}
            </Text>
          </View>
        </View>

        <Text className="text-gray-600 mb-1">
          <Text className="font-semibold">Scheduled:</Text> {new Date(pickup.createdAt).toLocaleString()}
        </Text>

        {pickup.completedAt && (
          <Text className="text-gray-600 mb-1">
            <Text className="font-semibold">Completed:</Text> {new Date(pickup.completedAt).toLocaleString()}
          </Text>
        )}

        <Text className="text-gray-600 mb-1">
          <Text className="font-semibold">Distance:</Text> {pickup.distance?.toFixed(2)} km
        </Text>

        <Text className="text-lg font-semibold mb-2">
          <Text className="font-semibold">Total Price:</Text> UGX {pickup.totalPrice?.toLocaleString()}
        </Text>

        <Text className="text-gray-600 mb-1">
          <Text className="font-semibold">Garbage Type:</Text> {
            pickup.garbageType === 'general' ? 'General Waste' :
            pickup.garbageType === 'recyclable' ? 'Recyclables' :
            pickup.garbageType === 'hazardous' ? 'Hazardous Waste' : 'Organic Waste'
          }
        </Text>

        <Text className="text-gray-600">
          <Text className="font-semibold">Sacks:</Text> {pickup.sackCount}
        </Text>
      </View>

      <View className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <Text className="text-lg font-bold text-gray-900 mb-3">
          Reviews ({reviews.length})
        </Text>
        {reviews.length > 0 ? (
          <FlatList
            data={reviews}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View className="border-b border-gray-100 pb-4 mb-4">
                <View className="flex-row items-center mb-2">
                  (
                    <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center mr-3">
                      <MaterialCommunityIcons name="account" size={20} color="#6b7280" />
                    </View>
                  )}
                  <View>
                    <Text className="font-medium">{item.userName}</Text>
                    <StarRating rating={item.rating} starSize={16} />
                  </View>
                </View>
                <Text className="text-gray-600">{item.text}</Text>
                <Text className="text-gray-400 text-xs mt-2">
                  {format(new Date(item.createdAt), 'MMM d, yyyy')}
                </Text>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        ) : (
          <Text className="text-gray-400 text-center py-4">No reviews yet</Text>
        )}
      </View>
    </View>
  );
}
