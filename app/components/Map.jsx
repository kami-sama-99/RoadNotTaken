"use client";

import { GoogleMap, LoadScript } from "@react-google-maps/api";
import React from "react";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const center = {
  lat: 12.9716, // Example: Bangalore
  lng: 77.5946,
};

const navigationMapStyles = [
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#808080" }], // Grey roads
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#a8a8a8" }], // Light grey highways
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#a8a8a8" }], // Light grey arterials
  },
  {
    featureType: "road.local",
    elementType: "geometry",
    stylers: [{ color: "#a8a8a8" }], // Light grey local
  },
  {
    featureType: "landscape",
    stylers: [{ color: "#f0f0f0" }], // Light grey landscape
  },
  // Add more styles to further customize the map
];

const MapComponent = () => {
  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={16} // Closer for navigation view
        options={{
          disableDefaultUI: false, // Show default UI controls
          zoomControl: true, // Allow zooming
          fullscreenControl: true, // Fullscreen button
          streetViewControl: true, // Enable Street View
          mapTypeControl: false, // Hide map type switcher
          tilt: 60, // More pronounced 3D effect
          gestureHandling: "greedy", // Allow smooth touch & scroll zoom
          mapTypeId: "roadmap", // Ensure roadmap type
          styles: navigationMapStyles, // Apply custom styles
        }}
      />
    </LoadScript>
  );
};

export default MapComponent;