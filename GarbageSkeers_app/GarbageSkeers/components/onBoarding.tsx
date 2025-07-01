import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: any; // require('./path') or URL
  backgroundColor?: string;
  textColor?: string;
}

interface OnboardingProps {
  slides: OnboardingSlide[];
  onComplete?: () => void;
  completeButtonText?: string;
}

const { width } = Dimensions.get('window');

export default function Onboarding({ 
  slides, 
  onComplete, 
  completeButtonText = "Get Started" 
}: OnboardingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { finishOnBoard } = useAuthStore();

  onComplete = () =>{

    finishOnBoard();
    router.push('/(auth)/roleSelection');
    
  }

  const scrollTo = (index: number) => {
    if (index < 0 || index >= slides.length) return;
    setCurrentIndex(index);
    slidesRef.current?.scrollToIndex({ index, animated: true });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        ref={slidesRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[
            styles.slide, 
            { backgroundColor: item.backgroundColor || '#fff' }
          ]}>
            <Image 
              source={item.image} 
              style={styles.image} 
              resizeMode="contain" 
            />
            <View style={styles.textContainer}>
              <Text style={[
                styles.title, 
                { color: item.textColor || '#000' }
              ]}>
                {item.title}
              </Text>
              <Text style={[
                styles.description, 
                { color: item.textColor || '#666' }
              ]}>
                {item.description}
              </Text>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        {/* Pagination */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View 
              key={index}
              style={[
                styles.paginationDot,
                currentIndex === index ? styles.activeDot : styles.inactiveDot
              ]}
            />
          ))}
        </View>

        {/* Navigation */}
        {currentIndex < slides.length - 1 ? (
          <Pressable
            style={styles.nextButton}
            onPress={() => scrollTo(currentIndex + 1)}
          >
            <Text style={styles.buttonText}>Next</Text>
          </Pressable>
        ) : (
          <>
            <Pressable
              style={[styles.nextButton, styles.completeButton]}
              onPress={onComplete}
              className='bg-green-600 p-4 rounded-full flex items-center'
            >
              <Text style={styles.buttonText}>{completeButtonText}</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: 40,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#4CAF50',
    width: 20,
  },
  inactiveDot: {
    backgroundColor: '#D3D3D3',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});