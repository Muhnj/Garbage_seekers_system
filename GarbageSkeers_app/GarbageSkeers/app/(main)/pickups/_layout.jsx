import { Stack } from 'expo-router'
import { StyleSheet } from 'react-native'

export default function ReportLayout() {
  return (
    <Stack>
        <Stack.Screen name="index" options={{ title: "Recent Pickup Activities", headerShown: true}}></Stack.Screen>
        <Stack.Screen name="[id]" options={{ title: "Garbage Pickup Details"}}></Stack.Screen>
    </Stack>
  )
}

const styles = StyleSheet.create({})
