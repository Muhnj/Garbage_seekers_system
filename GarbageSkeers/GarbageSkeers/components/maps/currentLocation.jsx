"use client";
import React, { use, useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  Polyline,
} from "@react-google-maps/api";
import { userManager, collectorManager, shiftManager } from "@/libs/resourceManagement";

// Map container style
const containerStyle = {
  width: "100%",
  height: "600px",
};

// Mock data
// const initialOffices = [
//   { id: 1, name: "Officer A", lat: 0.3136, lng: 32.5811, clientId: 101 },
//   { id: 2, name: "Officer B", lat: 0.3476, lng: 32.5825, clientId: 102 },
//   { id: 3, name: "Officer C", lat: 0.321, lng: 32.586, clientId: 103 },
// ];

// const initialResidents = [
//   { id: 101, name: "Client Alpha", lat: 0.3142, lng: 32.582 },
//   { id: 102, name: "Client Beta", lat: 0.3468, lng: 32.5805 },
//   { id: 103, name: "Client Gamma", lat: 0.3205, lng: 32.5845 },
// ];

const GoogleMapComponent = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [collectors, setCollectors] = useState([]);
  const [clients, setClient] = useState([]);
  const [shifts, setShifts] = useState([]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        (err) => console.error("Geolocation error:", err)
      );
    }
  }, []);

  // Simulate real-time collector movement
  useEffect(() => {
    const interval = setInterval(() => {
      setCollectors((prev) =>
        prev.map((o) => ({
          ...o,
          lat: o.lat + (Math.random() - 0.5) * 0.0005,
          lng: o.lng + (Math.random() - 0.5) * 0.0005,
        }))
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getClientById = (id) => clients.find((c) => c.id === id);

  


  useEffect(() => {
    // Fetch collectors and clients from the resource managers
    const fetchCollectors = async () => {
      const fetchedCollectors = await collectorManager.getAll();
      const shiftData = await shiftManager.getAll();
      const clientData = await userManager.getAll();

      //Get clients on map
      

      const updatedCollectors = fetchedCollectors.map((collector) => {

        if(collector?.status === 'checked-in'){
          console.log("Officer is checked-in:", collector);
          // find client
          const shiftAttached = shiftData.find(shift => shift.id === collector.shiftId);
          const clientAttached = clientData.find(client => client.id === shiftAttached?.client.id);
          console.log("Client for collector:", clientAttached);
          return {
          id: collector.id,
          name: `${collector.firstName} || ${collector?.collectorNumber}`,
          lat: collector?.location?.lat || 0, // Default to a specific location if not set
          lng: collector?.location?.lng || 0,  // Default to a specific location if not set
          clientId: clientAttached?.id,// clientName: client ? client.name : "Unknown Client",
        };
        }

        return {
          id: collector.id,
          name: collector.firstName,
          lat: collector?.location?.lat || 0, // Default to a specific location if not set
          lng: collector?.location?.lng || 0,  // Default to a specific location if not set
          clientId: null, // No client assigned
        };
      });
      setCollectors(updatedCollectors);
      console.log("Fetched Collectors:", updatedCollectors);
    };

    const fetchResidents = async () => {
      const fetchedResidents = await userManager.getAll();
      const updatedResidents = fetchedResidents.map(client => ({
        id: client.id,
        name: client.firstName || client.company_name,
        lat: client?.location?.lat || 0, // Default to a specific location if not set
        lng: client?.location?.lng || 0,  // Default to a specific location if not set
      })); 
      setClient(updatedResidents);
      console.log("Fetched Residents:", updatedResidents);
    };

    fetchCollectors();
    fetchResidents();

  }, []);

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-3">Officer Deployment Map</h2>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userLocation || { lat: 0.3136, lng: 32.5811 }}
        zoom={13}
      >
        {/* User location */}
        {userLocation && (
          <Marker
            position={userLocation}
            label="You"
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/emerald-dot.png",
            }}
          />
        )}

        {/* Client markers */}
        {clients.map((client) => (
          <Marker
            key={client.id}
            position={{ lat: client.lat, lng: client.lng }}
            label={client.name}
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
            }}
          />
        ))}

        {/* Officer markers and lines to clients */}
        {collectors.map((collector) => {
          const client = getClientById(collector.clientId);
          const path = client
            ? [
                { lat: collector.lat, lng: collector.lng },
                { lat: client.lat, lng: client.lng },
              ]
            : [];

          return (
            <React.Fragment key={collector.id}>
              <Marker
                position={{ lat: collector.lat, lng: collector.lng }}
                label={collector.name}
                icon={{
                  url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                }}
              />
              {client && (
                <Polyline
                  path={path}
                  options={{
                    strokeColor: "#FF0000",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </GoogleMap>
    </div>
  );
};

export default GoogleMapComponent;
