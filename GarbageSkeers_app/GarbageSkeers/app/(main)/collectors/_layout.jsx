import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function CollectorLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1}}>
      <Stack>
          <Stack.Screen name="display" options={{ headerShown: false}}/>
          <Stack.Screen name="details" options={{ headerShown: false}}/>
      </Stack>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({})