import { StarRatingDisplay, StarRatingInput } from '@/components/Rating'; // Create this component
import { db } from '@/firebase/firebase';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

export default function PickupDetails() {
  const { id } = useLocalSearchParams();
  const [pickup, setPickup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

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
    if (!rating) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    try {
      const pickupRef = doc(db, 'pickups', id as string);
      await updateDoc(pickupRef, {
        rating,
        review,
        reviewedAt: new Date().toISOString()
      });

      Alert.alert('Success', 'Thank you for your review!');
      router.back();
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review');
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

      {pickup.status === 'completed' && (
        <View className="bg-white rounded-lg p-4 shadow-sm">
          {pickup.rating ? (
            <View>
              <Text className="font-bold mb-2">Your Review</Text>
              <StarRatingDisplay rating={pickup.rating} />
              {pickup.review && (
                <Text className="mt-2 text-gray-700">{pickup.review}</Text>
              )}
            </View>
          ) : (
            <View>
              <Text className="font-bold mb-2">Rate this pickup</Text>
              <StarRatingInput
                rating={rating}
                onRatingChange={setRating}
              />
              <TextInput
                className="border border-gray-300 rounded p-3 mt-3"
                placeholder="Write your review (optional)"
                multiline
                numberOfLines={3}
                value={review}
                onChangeText={setReview}
              />
              <Pressable
                className="bg-blue-500 py-3 px-4 rounded-lg mt-3"
                onPress={handleSubmitReview}
              >
                <Text className="text-white text-center font-bold">Submit Review</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
