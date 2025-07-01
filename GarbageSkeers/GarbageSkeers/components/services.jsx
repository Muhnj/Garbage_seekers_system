import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function ServicesPanel() {
  return (
    <View className='my-8'>
      <Text className='text-lg font-bold mb-8'>Our Services</Text>
      <View className='flex-1 flex-row flex-wrap w-full gap-4'>
        <View className='h-48 w-[49%] rounded-md bg-rose-200'>

        </View>
        <View className='h-48 w-[49%] rounded-md bg-rose-200'>

        </View>
        <View className='h-48 w-[32%] rounded-md bg-rose-200'>

        </View>
        <View className='h-48 w-[32%] rounded-md bg-rose-200'>

        </View>
        <View className='h-48 w-[32%] rounded-md bg-rose-200'>

        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({})