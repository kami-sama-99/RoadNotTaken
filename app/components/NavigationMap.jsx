import { useEffect, useRef, useState } from "react";
import { decodePolyline, calculateOverlap } from "@/utils/polyline";
import { fetchAllRoutesFromFirestore } from "@/firebase/routes";

const NavigationMap = ({ start, end }) => {
  const mapRef = useRef(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [firestoreRoutes, setFirestoreRoutes] = useState([]);
  const [bestRouteIndex, setBestRouteIndex] = useState(null);

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

  // Fetch Firestore routes when Google Maps is loaded and parameters are available
  useEffect(() => {
    if (isGoogleMapsLoaded && start && end) {
      // Fetch the polycoded routes from Firestore
      fetchAllRoutesFromFirestore().then((routes) => {
        if (routes && routes.length > 0) {
          setFirestoreRoutes(routes.map(decodePolyline));
        } else {
          console.log("No routes found in Firestore.");
        }
      });
    }
  }, [isGoogleMapsLoaded, start, end]);

  // Ensure all parameters are loaded before proceeding with the map
  useEffect(() => {
    if (!isGoogleMapsLoaded || !start || !end || firestoreRoutes.length === 0) return;

    const map = new google.maps.Map(mapRef.current, {
      zoom: 14,
      center: { lat: 40.7128, lng: -74.0060 }, // Default to New York if no start point
    });

    const directionsService = new google.maps.DirectionsService();
    const routeRenderers = [];

    const calculateAndDisplayRoute = () => {
      directionsService.route(
        {
          origin: start,
          destination: end,
          travelMode: google.maps.TravelMode.DRIVING,
          provideRouteAlternatives: true, // Request multiple routes
        },
        (response, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            const limitedRoutes = response.routes.slice(0, 5); // Limit to 5 routes
            let bestScore = Infinity;
            let optimalIndex = null;

            limitedRoutes.forEach((route, index) => {
              const decodedRoute = decodePolyline(route.overview_polyline);
              let totalOverlap = 0;
              
              firestoreRoutes.forEach((firestoreRoute) => {
                totalOverlap += calculateOverlap(decodedRoute, firestoreRoute);
              });

              const score = route.legs[0].duration.value + totalOverlap * 10; // Weighting factor for overlap
              if (score < bestScore) {
                bestScore = score;
                optimalIndex = index;
              }
            });

            setBestRouteIndex(optimalIndex);

            limitedRoutes.forEach((route, index) => {
              const isBest = index === optimalIndex;
              const directionsRenderer = new google.maps.DirectionsRenderer({
                map,
                directions: response,
                routeIndex: index, // Display different routes
                polylineOptions: {
                  strokeColor: isBest ? "#000000" : "#FFEB3B", // Black for best route
                  strokeOpacity: 0.7,
                  strokeWeight: 5,
                },
              });
              routeRenderers.push(directionsRenderer);
            });

            // Render Firestore routes as polylines on the map
            firestoreRoutes.forEach((firestoreRoute, index) => {
              const polyline = new google.maps.Polyline({
                path: firestoreRoute,
                geodesic: true,
                strokeColor: "#F44336", // Red color for Firestore routes
                strokeOpacity: 0.7,
                strokeWeight: 5,
              });
              polyline.setMap(map);
            });
          } else {
            alert("Directions request failed due to " + status);
          }
        }
      );
    };

    calculateAndDisplayRoute();
  }, [isGoogleMapsLoaded, start, end, firestoreRoutes]);

  return (
    <div className="md:col-span-2 mt-4 md:mt-0 rounded-lg shadow-md overflow-hidden h-fit w-full">
      <div ref={mapRef} style={{ height: "500px", width: "100%" }}></div>
    </div>
  );
};

export default NavigationMap;
