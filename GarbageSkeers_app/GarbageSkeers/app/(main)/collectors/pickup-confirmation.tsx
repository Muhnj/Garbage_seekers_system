import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PickupConfirmation() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Green Checkmark */}
      <View style={styles.checkmarkContainer}>
        <MaterialIcons name="check-circle" size={80} color="#4CAF50" />
      </View>

      {/* Confirmation Message */}
      <Text style={styles.title}>Pickup Scheduled!</Text>
      <Text style={styles.text}>
        Your garbage pickup has been scheduled successfully. Make sure your cash is ready for quick payment.
      </Text>

      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.push('/(main)/collectors/display')}
      >
        <MaterialIcons name="arrow-back" size={24} color="white" />
        <Text style={styles.backButtonText}>Back to Map</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  checkmarkContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});