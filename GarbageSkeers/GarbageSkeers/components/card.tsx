import { Text, View, ImageBackground, Button, TouchableOpacity } from 'react-native';
import React from 'react';
import '@/global.css';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const tips = [
  "Always separate your waste: recyclables, compost, and trash.",
  "Plastic takes over 400 years to degrade. Reduce usage!",
  "Turn food waste into compost — great for gardens and the planet.",
  "Say no to single-use plastics whenever possible.",
  "Report illegal dumping to help your community stay clean.",
  "Use reusable bags, bottles, and containers to cut down waste.",
];

export default function ContentCard() {
  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <ImageBackground
      source={require('@/assets/images/card-image.jpg')} // You can use local images too
      className="w-full md:w-1/2 h-78 rounded-md shadow-lg overflow-hidden mt-12"
      imageStyle={{ borderRadius: 12 }}
    >
      <View className="flex-1 bg-green-900/90 p-4 rounded-md gap-4">
        <Text className="text-2xl font-bold text-white">#BeAware</Text>
        <View className="flex-1 flex-row gap-4 mt-4 items-center">
          <FontAwesome name="recycle" size={48} color="#fff" />
          <Text className="flex-1 text-white text-lg">{randomTip}</Text>
        </View>
        <TouchableOpacity className='bg-white py-2 px-4 flex justify-center items-center rounded-md'>
          <Text className='text-green-950'>Lets Save the world</Text>
        </TouchableOpacity>

        <Text className='text-center text-white'>Learn more about Waste management?</Text>
      </View>
      
    </ImageBackground>
  );
}
