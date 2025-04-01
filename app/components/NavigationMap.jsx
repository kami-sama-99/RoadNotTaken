"use client";
import { useEffect, useRef, useState } from "react";

const NavigationMap = ({ start, end }) => {
  const mapRef = useRef(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  // Load Google Maps script dynamically
  useEffect(() => {
    if (typeof window !== "undefined" && !window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      window.initMap = () => setIsGoogleMapsLoaded(true);
    } else {
      setIsGoogleMapsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isGoogleMapsLoaded || !start || !end) return;

    const map = new google.maps.Map(mapRef.current, {
      zoom: 14,
      center: { lat: 40.7128, lng: -74.0060 }, // Default to New York if no start point
    });

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    const calculateAndDisplayRoute = () => {
      directionsService.route(
        {
          origin: start,
          destination: end,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(response);
          } else {
            alert("Directions request failed due to " + status);
          }
        }
      );
    };

    calculateAndDisplayRoute();
  }, [start, end, isGoogleMapsLoaded]);

  return (
    <div className="md:col-span-2 mt-4 md:mt-0 rounded-lg shadow-md overflow-hidden h-fit w-full">
      <div
        ref={mapRef}
        style={{ height: "500px", width: "100%" }}
      ></div>
    </div>
  );
};

export default NavigationMap;
