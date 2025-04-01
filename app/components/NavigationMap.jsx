import { useEffect, useRef, useState } from "react";
import { decodePolyline } from "@/utils/polyline";
import { calculateOverlapLength, calculateRouteScore, renderRoutes } from "@/utils/mapUtils";
import { fetchAllRoutesFromFirestore } from "@/firebase/routes";

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

  useEffect(() => {
    if (isGoogleMapsLoaded && start && end) {
      // Fetch the polycoded routes from Firestore
      fetchAllRoutesFromFirestore().then((routes) => {
        setFirestoreRoutes(routes.map(decodePolyline));
      });
    }
  }, [isGoogleMapsLoaded, start, end]);

  useEffect(() => {
    if (!isGoogleMapsLoaded || !start || !end || firestoreRoutes.length === 0) return;

    const map = new google.maps.Map(mapRef.current, {
      zoom: 14,
      center: { lat: 40.7128, lng: -74.0060 }, // Default to New York if no start point
    });

    const directionsService = new google.maps.DirectionsService();
    
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

            limitedRoutes.forEach((route, index) => {
              // Decode the Google Maps polyline
              const googleRoute = decodePolyline(route.overview_polyline.points);

              // Check overlap with Firestore routes
              firestoreRoutes.forEach((firestoreRoute) => {
                const overlapLength = calculateOverlapLength(googleRoute, firestoreRoute);
                const routeScore = calculateRouteScore(route, overlapLength, route.legs[0].duration);

                // Render the best route on the map
                renderRoutes(map, response, googleRoute, routeScore);
              });
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
