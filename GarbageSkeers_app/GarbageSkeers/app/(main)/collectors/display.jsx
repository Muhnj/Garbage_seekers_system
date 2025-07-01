import { View, StyleSheet } from 'react-native';
import GarbageCollectorMap from '@/components/GarbageCollectorMap';

export default function Home() {
  return (
    <View style={styles.container}>
      <GarbageCollectorMap />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});