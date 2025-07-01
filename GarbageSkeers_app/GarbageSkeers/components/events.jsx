import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function EventsPanel() {
  return (
    <View className='block my-8'>
      <Text className='text-lg font-bold'>Discover Garbage Collectors</Text>
      <View className='py-4'>
        <View>
            <Text className='text-center text-slate-500'>No Collect Available for now</Text>
        </View>
      </View>
      <View>

      </View>
    </View>
  )
}

const styles = StyleSheet.create({})