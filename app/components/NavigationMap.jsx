import { useEffect, useRef, useState } from "react";
import { decodePolyline, calculateOverlap } from "@/utils/polyline";
import { fetchAllRoutesFromFirestore } from "@/firebase/routes";

const NavigationMap = ({ start, end }) => {
  const mapRef = useRef(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [firestoreRoutes, setFirestoreRoutes] = useState([]);
  const [bestRouteIndex, setBestRouteIndex] = useState(null);
  const [firestorePolylines, setFirestorePolylines] = useState([]);
  const [routeRenderers, setRouteRenderers] = useState([]);
  const [bestRoute, setBestRoute] = useState(null);
  const [fastestRoute, setFastestRoute] = useState(null);

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
      fetchAllRoutesFromFirestore().then((routes) => {
        if (routes && routes.length > 0) {
          setFirestoreRoutes(routes.map(decodePolyline));
        } else {
          console.log("No routes found in Firestore.");
        }
      });
    }
  }, [isGoogleMapsLoaded, start, end]);

  useEffect(() => {
    if (!isGoogleMapsLoaded || !start || !end || firestoreRoutes.length === 0) return;

    const map = new google.maps.Map(mapRef.current, {
      zoom: 14,
      center: { lat: 40.7128, lng: -74.0060 },
    });

    const directionsService = new google.maps.DirectionsService();
    const newRouteRenderers = [];

    directionsService.route(
      {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      },
      (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          const limitedRoutes = response.routes.slice(0, 10);
          let bestScore = Infinity;
          let optimalIndex = null;
          let optimalRoute = null;

          setFastestRoute(decodePolyline(limitedRoutes[0].overview_polyline));

          limitedRoutes.forEach((route, index) => {
            const decodedRoute = decodePolyline(route.overview_polyline);
            let totalOverlap = 0;
            
            firestoreRoutes.forEach((firestoreRoute) => {
              totalOverlap += calculateOverlap(decodedRoute, firestoreRoute);
            });

            const score = route.legs[0].duration.value + totalOverlap * 10;
            console.log("Route: " + score);
            if (score < bestScore) {
              bestScore = score;
              optimalIndex = index;
              optimalRoute = decodedRoute;
            }
          });

          setBestRouteIndex(optimalIndex);
          setBestRoute(optimalRoute);

          limitedRoutes.forEach((route, index) => {
            const isBest = index === optimalIndex;
            const directionsRenderer = new google.maps.DirectionsRenderer({
              map,
              directions: response,
              routeIndex: index,
              polylineOptions: {
                strokeColor: isBest ? "#000000" : "#FFEB3B",
                strokeOpacity: 0.7,
                strokeWeight: 5,
              },
            });
            newRouteRenderers.push(directionsRenderer);
          });

          const polylines = firestoreRoutes.map((firestoreRoute) => {
            const polyline = new google.maps.Polyline({
              path: firestoreRoute,
              geodesic: true,
              strokeColor: "#F44336",
              strokeOpacity: 0.7,
              strokeWeight: 5,
            });
            polyline.setMap(map);
            return polyline;
          });
          setFirestorePolylines(polylines);
          setRouteRenderers(newRouteRenderers);
        } else {
          alert("Directions request failed due to " + status);
        }
      }
    );
  }, [isGoogleMapsLoaded, start, end, firestoreRoutes]);

  const handleRedirect = () => {
    if (!bestRoute || !fastestRoute || bestRoute.length < 2 || fastestRoute.length < 2) {
      alert("No optimal route found.");
      return;
    }

    const waypoints = bestRoute.filter(({ lat, lng }) =>
      !fastestRoute.some((point) => point.lat === lat && point.lng === lng)
    );

    const waypointString = waypoints.slice(0, 3).map(({ lat, lng }) => `${lat},${lng}`).join("/");
    const googleMapsUrl = `https://www.google.com/maps/dir/${start}/${waypointString}/${end}`;
    window.open(googleMapsUrl, "_blank");
  };

  return (
    <div className="md:col-span-2 mt-4 md:mt-0 rounded-lg shadow-md overflow-hidden h-fit w-full">
      <div ref={mapRef} style={{ height: "500px", width: "100%" }}></div>
      <button 
        onClick={handleRedirect} 
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Navigate with Google Maps
      </button>
    </div>
  );
};

export default NavigationMap;
