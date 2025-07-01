// components/StarRating.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

export default function StarRating({ 
  rating, 
  editable = false, 
  onRatingChange, 
  starSize = 24 
}) {
  const [currentRating, setCurrentRating] = useState(rating);

  const handleRating = (newRating) => {
    if (editable) {
      setCurrentRating(newRating);
      if (onRatingChange) {
        onRatingChange(newRating);
      }
    }
  };

  return (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity 
          key={star} 
          onPress={() => handleRating(star)}
          disabled={!editable}
        >
          <MaterialCommunityIcons
            name={star <= currentRating ? 'star' : 'star-outline'}
            size={starSize}
            color={star <= currentRating ? '#f59e0b' : '#d1d5db'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}