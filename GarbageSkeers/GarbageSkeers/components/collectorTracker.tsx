import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

const { width, height } = Dimensions.get('window');

type Props = {
  pickupLocation: { latitude: number; longitude: number };
};

const CollectorTracker: React.FC<Props> = ({ pickupLocation }) => {
  const [collectorLocation, setCollectorLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return;
      }

      const subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 10 },
        (location) => {
          setCollectorLocation(location.coords);
          
          // Center map on new location
          mapRef.current?.animateToRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });
        }
      );

      return () => subscription.remove();
    })();
  }, []);

  if (!collectorLocation) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Route Information */}
      {routeInfo && (
        <View style={styles.routeInfoContainer}>
          <Text style={styles.routeInfoText}>
            Distance: {(routeInfo.distance / 1000).toFixed(1)} km
          </Text>
          <Text style={styles.routeInfoText}>
            Time: {Math.ceil(routeInfo.duration / 60)} min
          </Text>
        </View>
      )}

      {/* Map with Directions */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: collectorLocation.latitude,
          longitude: collectorLocation.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        <Marker
          coordinate={pickupLocation}
          title="Pickup Location"
          pinColor="red"
        >
            <Image
              source={require('@/assets/images/resident.png')} // Replace with your pin image
              style={{ width: 40, height: 40 }}
            />
        </Marker>
        <Marker
          coordinate={{
              latitude: collectorLocation.latitude,
              longitude: collectorLocation.longitude,
            }}
          title="Collector Location"
          pinColor="red"
        >
            <Image
              source={require('@/assets/images/collector.png')} // Replace with your pin image
              style={{ width: 40, height: 40 }}
            />
        </Marker>

        {/* Directions */}
        {collectorLocation && (
          <MapViewDirections
            origin={{
              latitude: collectorLocation.latitude,
              longitude: collectorLocation.longitude,
            }}
            destination={pickupLocation}
            apikey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}// Replace with your API key
            strokeWidth={4}
            strokeColor="#3b82f6"
            mode="DRIVING"
            onReady={(result) => {
              setRouteInfo({
                distance: result.distance,
                duration: result.duration,
              });
              
              // Fit the map to the route
              mapRef.current?.fitToCoordinates(result.coordinates, {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
              });
            }}
            onError={(errorMessage) => {
              console.error('Directions error:', errorMessage);
            }}
          />
        )}
      </MapView>

      {/* Navigation Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Navigation Instructions:</Text>
        <Text style={styles.instructionsText}>
          • Follow the blue route line to reach the pickup location
        </Text>
        <Text style={styles.instructionsText}>
          • Your current location is shown with a blue dot
        </Text>
        <Text style={styles.instructionsText}>
          • The red pin marks the pickup location
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width,
    height: height * 0.4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeInfoContainer: {
    backgroundColor: 'white',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  routeInfoText: {
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  instructionsContainer: {
    backgroundColor: 'white',
    padding: 15,
    marginTop: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  instructionsTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1f2937',
  },
  instructionsText: {
    color: '#4b5563',
    marginBottom: 3,
  },
});

export default CollectorTracker;