import React from 'react';
import {Stack} from 'expo-router';


export default function HomeLayout(){
  return(
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen  name="index" />
      <Stack.Screen  name="report" />
      <Stack.Screen  name="[id]" options={{ headerShown: true, title: "Last Pickup Details"}}/>


    </Stack>
  )
}
