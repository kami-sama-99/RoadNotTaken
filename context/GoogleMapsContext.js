"use client";

import { createContext, useContext, useState, useEffect } from "react";

// Create the context
const GoogleMapsContext = createContext();

// Custom hook to access Google Maps context
export const useGoogleMaps = () => {
  return useContext(GoogleMapsContext);
};

export const GoogleMapsProvider = ({ children }) => {
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [googleInstance, setGoogleInstance] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!window.google) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.onload = () => {
          setIsGoogleMapsLoaded(true);
          setGoogleInstance(window.google); // ✅ Now safe to access window.google
        };
        document.head.appendChild(script);
      } else {
        setIsGoogleMapsLoaded(true);
        setGoogleInstance(window.google);
      }
    }
  }, []);

  return (
    <GoogleMapsContext.Provider value={{ isGoogleMapsLoaded, google: googleInstance }}>
      {children}
    </GoogleMapsContext.Provider>
  );
};
