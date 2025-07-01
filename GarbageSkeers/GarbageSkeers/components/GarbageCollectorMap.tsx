import { db } from '@/firebase/firebase';
import { useCollectorData } from '@/hooks/useVerifiedCollectorsData';
import { RewardPoints } from '@/libs/ecohPointsService';
import { notification } from '@/libs/notifications';
import { useAuthStore } from '@/stores/useAuthStore';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { collection, doc, setDoc } from 'firebase/firestore';
import { getDistance } from 'geolib';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Toast from 'react-native-toast-message';

const garbageTypes = [
  { label: 'General Waste', value: 'general', priceFactor: 1.0 },
  { label: 'Recyclables', value: 'recyclable', priceFactor: 0.8 },
  { label: 'Hazardous Waste', value: 'hazardous', priceFactor: 1.5 },
  { label: 'Organic Waste', value: 'organic', priceFactor: 0.9 },
];

export default function GarbageCollectorMap() {
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedCollector, setSelectedCollector] = useState<any>(null);
  const [pickupLocation, setPickupLocation] = useState<any>(null);
  const [customLocation, setCustomLocation] = useState(false);
  const [sackCount, setSackCount] = useState('1');
  const [garbageType, setGarbageType] = useState('general');
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore();

  const collectorData = useCollectorData();
  const [nearbyCollectors, setNearbyCollectors] = useState<any[]>([]);

  const [routeDetails, setRouteDetails] = useState<{
    distance: number; // in kilometers
    duration: number;
    coordinates: any[];
  } | null>(null);

  const snapPoints = ['25%', '50%'];

  // Get user location and filter nearby collectors
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  // Filter collectors within 2km radius when location or collector data changes
  useEffect(() => {
    if (!location || !collectorData.length) return;

    const filtered = collectorData.filter(collector => {
      if (!collector?.lastLocation) return false;
      
      const distance = getDistance(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        },
        {
          latitude: collector.lastLocation.latitude,
          longitude: collector.lastLocation.longitude
        }
      ) / 1000; // Convert to km

      return distance <= 2; // 2km radius
    });

    setNearbyCollectors(filtered);
  }, [location, collectorData]);

  // Calculate price with distance-based pricing
  useEffect(() => {
    if (!selectedCollector || !pickupLocation || !location) return;

    const typeDetails = garbageTypes.find(t => t.value === garbageType);
    if (!typeDetails) return;

    // Calculate distance between pickup location and collector
    const distance = getDistance(
      {
        latitude: selectedCollector.lastLocation.latitude,
        longitude: selectedCollector.lastLocation.longitude
      },
      pickupLocation
    ) / 1000; // Convert to km

    // Calculate base price
    let price = selectedCollector.pricePerSack * parseInt(sackCount || '1') * typeDetails.priceFactor;

    // Apply distance-based pricing if beyond 2km
    if (distance > 2) {
      const sackNum = parseInt(sackCount || '1');
      const distanceFactor = sackNum <= 2 ? 0.3 : 0.2;
      price *= (1 + distanceFactor * (distance - 2));
    }

    setTotalPrice(Math.round(price));
  }, [selectedCollector, pickupLocation, sackCount, garbageType, location]);

  const handleCollectorPress = useCallback((collector: any) => {
    setSelectedCollector(collector);
    setCustomLocation(false);
    bottomSheetRef.current?.expand();
  }, []);

  const handleSetPickupLocation = useCallback(() => {
    if (location) {
      setPickupLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setCustomLocation(false);
    }
  }, [location]);

  const handleMapPress = useCallback((e: any) => {
    if (customLocation) {
      setPickupLocation(e.nativeEvent.coordinate);
    }
  }, [customLocation]);

  const handleDirectionsError = useCallback((errorMessage: any) => {
    console.error('Directions error:', errorMessage);

    if (!selectedCollector || !pickupLocation) return;

    const distanceInKm = getDistance(
      {
        latitude: selectedCollector.lastLocation.latitude,
        longitude: selectedCollector.lastLocation.longitude
      },
      {
        latitude: pickupLocation.latitude,
        longitude: pickupLocation.longitude
      }
    ) / 1000; // Convert meters to kilometers

    setRouteDetails({
      distance: distanceInKm,
      duration: 0,
      coordinates: [
        {
          latitude: selectedCollector.lastLocation.latitude,
          longitude: selectedCollector.lastLocation.longitude
        },
        {
          latitude: pickupLocation.latitude,
          longitude: pickupLocation.longitude
        }
      ]
    });
  }, [selectedCollector, pickupLocation]);

  const handleSubmitPickup = async () => {
    if (!selectedCollector || !pickupLocation || !routeDetails || !user?.id) return;
    setLoading(true);
    try {
      const pickupData = {
        collectorId: selectedCollector.id,
        collectorName: `${selectedCollector.firstName} ${selectedCollector.lastName}`,
        userId: user.id,
        contact: user.phone,
        contactPerson: user.firstName,
        pickupLocation,
        collectorLocation: {
          latitude: selectedCollector.lastLocation.latitude,
          longitude: selectedCollector.lastLocation.longitude,
        },
        sackCount: parseInt(sackCount),
        garbageType,
        totalPrice,
        distance: routeDetails.distance,
        duration: routeDetails.duration,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const newPickupRef = doc(collection(db, 'pickups'));
      await setDoc(newPickupRef, pickupData);
      await RewardPoints(user.id, 100);

      await notification.sendToCollector(
        selectedCollector.id,
        'New Pickup Request',
        `You have a new pickup request from ${user.firstName} ${user.lastName}`,
        {
          type: 'pickup_request',
          pickupId: newPickupRef.id,
          collectorId: selectedCollector.id,
          screen: `/(collector)/pickups/${newPickupRef.id}`,
          userId: user.id,
        }
      );

      Toast.show({
        type: 'success',
        text1: 'Pickup Requested successfully',
        text2: `Waiting for collector approval`,
      });
      router.push('/collectors/pickup-confirmation');
    } catch (error) {
      console.error('Error adding document: ', error);
      Toast.show({
        type: 'error',
        text1: 'Something went wrong!',
        text2: `Make sure you're connected to internet`,
      });
    } finally {
      setPickupLocation(null);
      setRouteDetails(null);
      setSelectedCollector(null);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        initialRegion={{
          latitude: 0.3136,
          longitude: 32.5811,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={handleMapPress}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            
            title="Your Location"
          >
            <Image
              source={require('@/assets/images/resident.png')} // Replace with your icon
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
          </Marker>
        )}

        {collectorData.map((collector) => (
          <Marker
            key={collector.id}
            coordinate={{
              latitude: collector.lastLocation.latitude,
              longitude: collector.lastLocation.longitude,
            }}
            title={`${collector.firstName} ${collector.lastName}`}
            description={`Rating: ${collector?.rating} | Price: UGX ${collector?.pricePerSack.toLocaleString()}`}
            onPress={() => handleCollectorPress(collector)}
          >
           <Image
              source={require('@/assets/images/collector.png')} // Replace with your icon
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
          </Marker>
        ))}

        {pickupLocation && (
          <Marker
            coordinate={pickupLocation}
            title="Pickup Location"
            pinColor="purple"
          />
        )}

        {selectedCollector && pickupLocation && (
          <MapViewDirections
            origin={{
              latitude: selectedCollector.lastLocation.latitude,
              longitude: selectedCollector.lastLocation.longitude
            }}
            destination={{
              latitude: pickupLocation.latitude,
              longitude: pickupLocation.longitude
            }}
            apikey="AIzaSyCt2ecs6OqL5Vrd-bDFkGCNGg988n99aTI"
            strokeWidth={4}
            strokeColor="#2196F3"
            mode="DRIVING"
            precision="high"
            onReady={result => {
              setRouteDetails({
                distance: result.distance,
                duration: result.duration,
                coordinates: result.coordinates
              });

              mapRef.current?.fitToCoordinates(result.coordinates, {
                edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
                animated: true
              });
            }}
            onError={handleDirectionsError}
          />
        )}
      </MapView>

      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          {selectedCollector ? (
            <>
              <Text style={styles.collectorName}>{`${selectedCollector.firstName} ${selectedCollector.lastName}`}</Text>
              <Text>Rating: {selectedCollector.rating} ⭐</Text>
              <Text>Price per sack: UGX {selectedCollector.pricePerSack.toLocaleString()}</Text>
              <Text>
                Status: {selectedCollector.isAvailable ? 'Available' : 'Unavailable'}
              </Text>

              {!pickupLocation ? (
                <>
                  <Pressable
                    style={styles.button}
                    onPress={handleSetPickupLocation}
                    disabled={!selectedCollector.isAvailable}
                  >
                    <Text style={styles.buttonText}>
                      {selectedCollector.isAvailable
                        ? 'Set Pickup at My Location'
                        : 'This collector is not available'}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[styles.button, { backgroundColor: '#FFA500' }]}
                    onPress={() => setCustomLocation(true)}
                    disabled={!selectedCollector.isAvailable}
                  >
                    <Text style={styles.buttonText}>Set Custom Location</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.sectionTitle}>Pickup Details</Text>

                  {routeDetails && (
                    <>
                      <Text style={styles.routeText}>
                        Distance: {routeDetails.distance.toFixed(2)} km
                        {routeDetails.duration > 0 &&
                          ` • Est. time: ${Math.ceil(routeDetails.duration)} min`}
                      </Text>
                      {routeDetails.distance > 2 && (
                        <Text style={styles.distanceWarning}>
                          Note: Price includes distance premium for {routeDetails.distance.toFixed(2)} km
                        </Text>
                      )}
                    </>
                  )}

                  <Text style={styles.label}>Number of Sacks:</Text>
                  <TextInput
                    style={styles.input}
                    value={sackCount}
                    onChangeText={setSackCount}
                    keyboardType="numeric"
                  />

                  <Text style={styles.label}>Garbage Type:</Text>
                  <Picker
                    selectedValue={garbageType}
                    onValueChange={setGarbageType}
                    style={styles.picker}
                  >
                    {garbageTypes.map((type) => (
                      <Picker.Item key={type.value} label={type.label} value={type.value} />
                    ))}
                  </Picker>

                  {totalPrice > 0 && (
                    <Text style={styles.priceText}>
                      Total Price: UGX {totalPrice.toLocaleString()}
                    </Text>
                  )}

                  <Pressable
                    style={styles.confirmButton}
                    onPress={handleSubmitPickup}
                    disabled={!selectedCollector.isAvailable || loading}
                  >
                    <Text style={styles.buttonText}>{ loading ? 'Processing ...' : 'Confirm Pickup' }</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.button, { backgroundColor: '#6d6d6d' }]}
                    onPress={() => {
                      setPickupLocation(null);
                      setRouteDetails(null);
                    }}
                  >
                    <Text style={styles.buttonText}>Change Location</Text>
                  </Pressable>
                </>
              )}
            </>
          ) : (
            <View>
              <Text className='text-xl font-bold mb-4 text-gray-600'>
                {nearbyCollectors.length > 0 
                  ? 'Garbage collectors near you (within 2km)'
                  : 'No collectors within 2km - explore the map for options'}
              </Text>
              
              <View className='flex flex-col gap-4'>
                {nearbyCollectors.length > 0 ? (
                  nearbyCollectors.map((collector) => (
                    <Pressable
                      key={collector.id}
                      className='col-span-2 flex-row items-center gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50 relative'
                      onPress={() => handleCollectorPress(collector)}
                    >
                      <Image
                        source={{ uri: collector.collectorPhoto || 'https://via.placeholder.com/150' }}
                        style={{ width: 50, height: 50, borderRadius: 25 }}
                      />
                      <View className=''>
                        <Text className='text-lg font-bold'>{`${collector.firstName} ${collector.lastName}`}</Text>
                        <Text className='text-sm'>Base Price: UGX {collector.pricePerSack.toLocaleString()} | Uses: {collector.equipmentType}</Text>
                        <Text className='text-xs text-gray-600'>Rating: {collector.rating} ⭐ | {collector.isAvailable ? 'Available' : 'Offline'}</Text>
                      </View>
                    </Pressable>
                  ))
                ) : (
                  <Text className='text-gray-500'>
                    No collectors found within 2km. Zoom out on the map to find available collectors.
                    Note: Prices may be higher for distant collectors.
                  </Text>
                )}
              </View>
            </View>
          )}
        </BottomSheetView>
      </BottomSheet>

      {customLocation && (
        <View style={styles.customLocationOverlay}>
          <Text style={styles.overlayText}>Tap on map to set pickup location</Text>
          <Pressable
            style={[styles.button, { backgroundColor: '#FF0000' }]}
            onPress={() => setCustomLocation(false)}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  bottomSheetContent: {
    padding: 20,
  },
  collectorName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  routeText: {
    marginVertical: 8,
    color: '#555',
  },
  distanceWarning: {
    color: 'orange',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  label: {
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: 'green',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  customLocationOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  overlayText: {
    fontSize: 16,
    marginBottom: 10,
  },
});