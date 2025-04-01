import { useEffect, useRef, useState } from "react";
import { decodePolyline } from "@/utils/polyline";
import { calculateOverlapLength, calculateRouteScore, renderRoutes } from "@/utils/mapUtils";
import { fetchUserRoutesFromFirestore } from "@/firebase/routes";

const NavigationMap = ({ start, end }) => {
  const mapRef = useRef(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [firestoreRoutes, setFirestoreRoutes] = useState([]);

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
      fetchUserRoutesFromFirestore().then((routes) => {
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
    
    // Create multiple renderers for different routes
    const routeRenderers = [];

    const calculateAndDisplayRoute = () => {
      directionsService.route(
        {
          origin: start,
          destination: end,
          travelMode: google.maps.TravelMode.DRIVING,
          provideRouteAlternatives: true, // Request multiple routes
          provideRouteAlternatives: true, // Request multiple routes
        },
        (response, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            const limitedRoutes = response.routes.slice(0, 5); // Limit to 5 routes
    
            limitedRoutes.forEach((route) => {
              // Check if polyline points exist in the first step of the route
              if (route.legs && route.legs[0].steps && route.legs[0].steps[0].polyline) {
                const polylinePoints = route.legs[0].steps[0].polyline.points;
    
                if (polylinePoints) {
                  // Decode the Google Maps polyline
                  const decodedRoute = decodePolyline(polylinePoints);
    
                  // Check overlap with Firestore routes and calculate route score
                  firestoreRoutes.forEach((firestoreRoute) => {
                    const overlapLength = calculateOverlapLength(decodedRoute, firestoreRoute);
                    const routeScore = calculateRouteScore(route, overlapLength, route.legs[0].duration);
    
                    // Render the best route on the map
                    renderRoutes(map, response, decodedRoute, routeScore);
                  });
                } else {
                  console.error("Polyline points are missing.");
                }
              } else {
                console.error("Polyline data not found for the route.");
              }
            });
            const limitedRoutes = response.routes.slice(0, 5); // Limit to 5 routes

            limitedRoutes.forEach((route, index) => {
              const directionsRenderer = new google.maps.DirectionsRenderer({
                map,
                directions: response,
                routeIndex: index, // Display different routes
                polylineOptions: {
                  strokeColor: index === 0 ? "#1976D2" : "#FF5722", // Different colors for routes
                  strokeOpacity: 0.7,
                  strokeWeight: 5,
                },
              });
              routeRenderers.push(directionsRenderer);
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
