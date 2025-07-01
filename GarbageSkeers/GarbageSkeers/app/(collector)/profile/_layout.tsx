import { Stack } from 'expo-router'
import React from 'react'

export default function ProfileLayout(){
  return(
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit" options={{headerBackVisible: true, headerShown: true}}/>
      <Stack.Screen name="rewards" options={{headerBackVisible: true, headerShown: true}}/>
    </Stack>
  )
}
