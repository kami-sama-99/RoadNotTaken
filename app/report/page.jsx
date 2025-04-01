"use client";

import { useState, useRef, useEffect } from "react";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Loader } from "@googlemaps/js-api-loader";
import Header from "../components/Header";

const db = getFirestore();
const auth = getAuth();
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; // Replace with your API key

export default function LocationTracker() {
  const [tracking, setTracking] = useState(false);
  const [message, setMessage] = useState(
    "Click on the button to start tracking the route."
  );
  const [position, setPosition] = useState(null);
  const watchIdRef = useRef(null);
  const [user, setUser] = useState(null);
  const [map, setMap] = useState(null);
  const [polyline, setPolyline] = useState(null);
  const [path, setPath] = useState([]);
  const mapRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Detects mobile screens
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Call once on mount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Ensure authentication state is available
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Load Google Maps
  useEffect(() => {
    if (typeof window !== "undefined" && !map) {
      const loader = new Loader({
        apiKey: API_KEY,
        version: "weekly",
      });

      loader.load().then(() => {
        const google = window.google;
        const newMap = new google.maps.Map(mapRef.current, {
          center: { lat: 0, lng: 0 },
          zoom: 15,
        });
        const newPolyline = new google.maps.Polyline({
          path: [],
          geodesic: true,
          strokeColor: "#FF0000",
          strokeOpacity: 1.0,
          strokeWeight: 2,
        });

        newPolyline.setMap(newMap);
        setMap(newMap);
        setPolyline(newPolyline);
      });
    }
  }, []);

  const saveRoute = async () => {
    if (!user) {
      setMessage("User not authenticated.");
      return;
    }

    if (path.length === 0) {
      setMessage("No route to save.");
      return;
    }

    try {
      await addDoc(collection(db, "users", user.uid, "routes"), {
        encodedPolyline: google.maps.geometry.encoding.encodePath(path),
        timestamp: new Date().toISOString(),
      });

      setMessage("Route saved successfully!");
      setPath([]);
    } catch (error) {
      setMessage(`Error saving route: ${error.message}`);
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
        const newPosition = { lat: latitude, lng: longitude };
        setPosition(newPosition);
        setPath((prevPath) => [...prevPath, newPosition]);

        if (map) {
          map.setCenter(newPosition);
        }

        if (polyline) {
          const newPath = [...polyline.getPath().getArray(), newPosition];
          polyline.setPath(newPath);
        }
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
    saveRoute();
  };

  return (
    <>
      <Header />
      <div className="h-screen p-4 h-fit flex flex-col md:grid md:grid-cols-3 md:gap-4">
        {/* Left Section (Message & Button) */}
        <div
          className={
            "md:col-span-1 text-black bg-gray-100 p-4 rounded-lg shadow-md h-fit"
          }
        >
          <h2 className="text-2xl font-bold mb-6 text-blue-500 md:text-4xl">
            {message}
          </h2>

          {isClient && (
            <button
              onClick={tracking ? stopTracking : startTracking}
              className={`mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-8 rounded-md transition-colors text-center ${
                tracking
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-500 hover:bg-blue-700"
              }`}
            >
              {tracking ? "Stop Tracking" : "Start Tracking"}
            </button>
          )}

          {/* Guidelines Section */}
          <div className="mt-6 p-4 bg-gray-100 text-gray-700 rounded-lg shadow-md w-full max-w-lg">
            <h3 className="text-lg font-semibold text-gray-900">
              📌 Guidelines
            </h3>
            <ul className="mt-2 text-sm list-disc list-inside">
              <li>
                <strong>Before Starting:</strong> Ensure your GPS is enabled for
                accurate tracking.
              </li>
              <li>
                <strong>When to Start:</strong> Click "Start Tracking" when a
                poor road starts.
              </li>
              <li>
                <strong>Device Placement:</strong> Keep your device in an open
                area (e.g., pocket, dashboard) for better GPS reception.
              </li>
              <li>
                <strong>When to Stop:</strong> Click "Stop Tracking" when the
                poor road ends.
              </li>
              <li>
                <strong>Network Connection:</strong> Ensure an active internet
                connection for smooth tracking.
              </li>
            </ul>
          </div>
        </div>

        {/* Right Section (Map) */}
        <div className="md:col-span-2 mt-4 md:mt-0 rounded-lg shadow-md overflow-hidden">
          <div ref={mapRef} className="w-full h-full rounded-md" />
        </div>
      </div>
    </>
  );
}
