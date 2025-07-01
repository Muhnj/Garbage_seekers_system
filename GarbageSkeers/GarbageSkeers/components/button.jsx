import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { router } from 'expo-router'

export default function button({bgColor, Text, color, next, data}) {
  return (
    <TouchableOpacity style={{ backgroundColor: bgColor}}>
        <Text style={{ color: color}}> {Text}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({})