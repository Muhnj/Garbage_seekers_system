import GarbageCollectorMap from '@/components/GarbageCollectorMap';
import { StyleSheet, View } from 'react-native';


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