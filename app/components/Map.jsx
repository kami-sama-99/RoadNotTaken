"use client";

import React, { useEffect, useState } from "react";
import { GoogleMap, Polyline } from "@react-google-maps/api";
import { useGoogleMaps } from "@/context/GoogleMapsContext"; // Adjust the path as needed
import { db } from "@/firebase/firebase"; // Adjust the import path to your Firebase config
import { collection, getDocs } from "firebase/firestore";
import { GeoPoint } from "firebase/firestore"; // Import GeoPoint from Firestore

const containerStyle = {
  width: "100%",
  height: "500px",
};

const navigationMapStyles = [
  // Your map styles here
];

const MapComponent = ({ searchLocation }) => {
    console.log(searchLocation)
  const { isGoogleMapsLoaded } = useGoogleMaps(); // Get state from context
  const [polylines, setPolylines] = useState([]);
  const [center, setCenter] = useState({
    lat: 12.9716, // Default center: Bangalore
    lng: 77.5946,
  });
  const [zoom, setZoom] = useState(16); // Default zoom level

  useEffect(() => {
    if (searchLocation) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: searchLocation }, (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK) {
          const location = results[0].geometry.location;
          setCenter({
            lat: location.lat(),
            lng: location.lng(),
          });
          setZoom(18); // Set a higher zoom level for specific location
        } else {
          console.error("Geocode was not successful for the following reason: " + status);
        }
      });
    }
  }, [searchLocation]);

  useEffect(() => {
    if (!isGoogleMapsLoaded) return;

    const fetchReportedRoads = async () => {
      try {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);

        const allPolylines = [];

        for (const userDoc of usersSnapshot.docs) {
          const locationsCollection = collection(userDoc.ref, "locations");
          const locationsSnapshot = await getDocs(locationsCollection);

          const path = locationsSnapshot.docs.map((doc) => {
            const coordinates = doc.data().coordinates; // Get GeoPoint from Firestore

            if (coordinates instanceof GeoPoint) {
              const latitude = coordinates.latitude;
              const longitude = coordinates.longitude;
              console.log("Coordinates are " + latitude + longitude)
              return { lat: latitude, lng: longitude };
            }

            return null; // Handle if coordinates are not valid GeoPoint
          }).filter((coordinate) => coordinate !== null); // Filter out null values

          if (path.length > 1) {
            allPolylines.push(path);
          }
        }

        setPolylines(allPolylines);
        console.log(allPolylines);
      } catch (error) {
        console.error("Error fetching reported roads:", error);
      }
    };

    fetchReportedRoads();
  }, [isGoogleMapsLoaded]);

  if (!isGoogleMapsLoaded) {
    return <div>Loading Google Maps...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
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
    >
      {polylines.map((path, index) => (
        <Polyline
          key={index}
          path={path}
          options={{
            strokeColor: "#FF0000", // Red color for poor roads
            strokeOpacity: 0.8,
            strokeWeight: 50, // Make the line extremely thick
          }}
        />
      ))}
    </GoogleMap>
  );
};

export default MapComponent;
