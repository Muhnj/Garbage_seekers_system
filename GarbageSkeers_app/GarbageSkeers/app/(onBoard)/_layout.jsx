import { Stack } from 'expo-router'
import { StyleSheet } from 'react-native'

export default function BoardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name='index'></Stack.Screen>
    </Stack>
  )
}

const styles = StyleSheet.create({})