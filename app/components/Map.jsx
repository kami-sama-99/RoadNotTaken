"use client";

import React from "react";
import { GoogleMap } from "@react-google-maps/api";
import { useGoogleMaps } from "@/context/GoogleMapsContext"; // Adjust the path as needed

const containerStyle = {
  width: "100%",
  height: "500px",
};

const center = {
  lat: 12.9716, // Example: Bangalore
  lng: 77.5946,
};

const navigationMapStyles = [
  // Your map styles here
];

const MapComponent = () => {
  const { isGoogleMapsLoaded, google } = useGoogleMaps(); // Get the state from context

  if (!isGoogleMapsLoaded) {
    return <div>Loading Google Maps...</div>; // Display loading until Google Maps is loaded
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={16}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
        fullscreenControl: true,
        streetViewControl: true,
        mapTypeControl: false,
        tilt: 60,
        gestureHandling: "greedy",
        mapTypeId: "roadmap",
        styles: navigationMapStyles,
      }}
    />
  );
};

export default MapComponent;
