import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function PickupConfirmation() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pickup Scheduled!</Text>
      <Text style={styles.text}>Your garbage pickup has been scheduled successfully. Make sure your cash is near for quick payment</Text>

      <Link href="/collectors/display" asChild>
        <Text style={styles.link}>Back to Map</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  link: {
    color: '#2196F3',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
