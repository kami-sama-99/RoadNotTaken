"use client";

import { useState, useRef, useEffect } from "react";
import { getFirestore, collection, addDoc, GeoPoint } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Header from "../components/Header";

const db = getFirestore();
const auth = getAuth();

export default function LocationTracker() {
  const [tracking, setTracking] = useState(false);
  const [message, setMessage] = useState(
    "Click on the button to start tracking the route."
  );
  const [position, setPosition] = useState(null);
  const watchIdRef = useRef(null);
  const [user, setUser] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Ensure authentication state is available
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const saveLocation = async (latitude, longitude) => {
    if (!user) {
      setMessage("User not authenticated.");
      return;
    }

    const locationsRef = collection(db, "users", user.uid, "locations");
    const locationData = {
      coordinates: new GeoPoint(latitude, longitude),
      timestamp: new Date().toISOString(),
    };

    try {
      await addDoc(locationsRef, locationData);
      setMessage("Location saved successfully!");
    } catch (error) {
      setMessage(`Error saving location: ${error.message}`);
    }
  };

  const startTracking = () => {
    if (typeof window === "undefined") {
      setMessage("Geolocation is not supported in a server environment.");
      return;
    }

    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported by your browser.");
      return;
    }

    setTracking(true);
    setMessage("Tracking your location...");

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ latitude, longitude });
        saveLocation(latitude, longitude);
      },
      (error) => {
        setMessage(`Error: ${error.message}`);
      }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
    setMessage("Tracking stopped. Click to start again.");
    setPosition(null);
  };

  return (
    <div className="min-h-screen bg-white from-blue-500 to-purple-600 text-white">
      <Header />
      <div className="flex flex-col justify-center items-center min-h-screen p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-500 md:text-4xl">
          {message}
        </h2>
        {position && (
          <p className="mb-6 text-lg">
            Latitude: {position.latitude}, Longitude: {position.longitude}
          </p>
        )}
        {isClient && (
          <button
            onClick={tracking ? stopTracking : startTracking}
            className={`bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-8 rounded-md transition-colors text-center ${
              tracking
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-500 hover:bg-blue-700"
            }`}
          >
            {tracking ? "Stop Tracking" : "Start Tracking"}
          </button>
        )}
      </div>
    </div>
  );
}
