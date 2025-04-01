"use client"

import { createContext, useContext, useState, useEffect } from "react";

// Create the context
const GoogleMapsContext = createContext();

// Custom hook to access Google Maps context
export const useGoogleMaps = () => {
  return useContext(GoogleMapsContext);
};

export const GoogleMapsProvider = ({ children }) => {
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`; // Add your API key here
      script.async = true;
      script.onload = () => {
        setIsGoogleMapsLoaded(true);
      };
      document.head.appendChild(script);
    } else {
      setIsGoogleMapsLoaded(true);
    }
  }, []);

  // Provide Google Maps state and related values
  return (
    <GoogleMapsContext.Provider value={{ isGoogleMapsLoaded, google: window.google }}>
      {children}
    </GoogleMapsContext.Provider>
  );
};
