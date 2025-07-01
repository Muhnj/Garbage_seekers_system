import StarRating from '@/components/Rating';
import { collectorManager, pickupManager } from '@/libs/resourceManagement';
import { useAuthStore } from '@/stores/useAuthStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { arrayUnion } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function PickupDetails() {
  const { id } = useLocalSearchParams();
  const [pickup, setPickup] = useState<any>(null);
  const [review, setReview] = useState('');
  const [collector, setCollect] = useState([])
  const { user } = useAuthStore();
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  

  useEffect(() => {
    const fetchPickup = async () => {
      try {
        const pickupData = await pickupManager.get(id);
        setPickup(pickupData)
        console.log(pickupData);

        const collector = await collectorManager.get(pickupData?.collectorId)
          console.log(collector);

          if(collector?.reviews){
            setReviews(collector?.reviews)
            console.log('reviews: ', reviews);
          }else{
            console.log("Error : NO review found")
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
      router.push('/(auth)/login');
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

      // Update trainer's reviews and average rating
      const totalRatings = reviews.reduce((acc, review) => acc + review?.rating, 0);
      const averageRating = (totalRatings + rating) / (reviews.length + 1);

      //Upate the trainer's document with the new review and average rating
      await collectorManager.updateResource(pickup.collectorId, {
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
    } catch (error: any) {
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
    <SafeAreaView
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView className="flex-1 p-4 bg-gray-50">
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
          {/* Reviews Section */}
          <View className="bg-white rounded-xl shadow-sm p-6 mb-24">
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
                        <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center mr-3">
                          <MaterialCommunityIcons name="account" size={20} color="#6b7280" />
                        </View>
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
          {/* Write a Review Section */}
          {pickup?.status === 'completed' && (
            <View className="bg-white rounded-xl shadow-sm p-6 mb-4">
              <Text className="text-lg font-bold text-gray-900 mb-3">Write a Review</Text>
              <StarRating
                rating={rating}
                editable={true}
                onRatingChange={setRating}
                starSize={32}
              />
              <TextInput
                className="border border-gray-200 rounded-lg p-3 mt-3 h-24"
                multiline
                placeholder="Share your experience with this trainer?..."
                value={reviewText}
                onChangeText={setReviewText}
              />
              <TouchableOpacity
                className="bg-orange-500 rounded-lg p-3 mt-3 items-center"
                onPress={handleSubmitReview}
                disabled={submittingReview}
              >
                {submittingReview ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold">Submit Review</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}