// Calculate the distance between two LatLng points using the Haversine formula
// Render the routes on the Google Maps instance
export const renderRoutes = (map, directionsResponse, googleRoute, routeScore) => {
    const directionsRenderer = new google.maps.DirectionsRenderer({
      map: map,
      directions: directionsResponse,
      routeIndex: googleRoute.routeIndex, // To render the specific route on the map
      polylineOptions: {
        strokeColor: routeScore > 0.5 ? "#1976D2" : "#FF5722", // Use a different color based on the route score
        strokeOpacity: 0.7,
        strokeWeight: 5,
      },
    });
  
    // Optionally, add a marker for the start and end points
    new google.maps.Marker({
      position: googleRoute[0],
      map: map,
      title: "Start",
    });
  
    new google.maps.Marker({
      position: googleRoute[googleRoute.length - 1],
      map: map,
      title: "End",
    });
  };
  
export const calculateDistance = (pointA, pointB) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = pointA.lat * Math.PI / 180;
    const φ2 = pointB.lat * Math.PI / 180;
    const Δφ = (pointB.lat - pointA.lat) * Math.PI / 180;
    const Δλ = (pointB.lng - pointA.lng) * Math.PI / 180;
  
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c; // in meters
  };
  
  // Check if two points are close enough (within a specified threshold)
  export const isCloseEnough = (pointA, pointB, threshold = 20) => {
    return calculateDistance(pointA, pointB) < threshold;
  };
  
  // Calculate the overlap length between two polyline routes
  export const calculateOverlapLength = (route1, route2) => {
    let totalLength = 0;
  
    for (let i = 0; i < route1.length - 1; i++) {
      for (let j = 0; j < route2.length - 1; j++) {
        const pointA = route1[i];
        const pointB = route1[i + 1];
        const pointC = route2[j];
        const pointD = route2[j + 1];
  
        if (isCloseEnough(pointA, pointC) && isCloseEnough(pointB, pointD)) {
          totalLength += calculateDistance(pointA, pointC);
        }
      }
    }
  
    return totalLength;
  };
  
  // Calculate route score based on overlap length and time
  export const calculateRouteScore = (route, overlapLength, duration) => {
    const roughRoadFactor = overlapLength / route.distance.value; // relative rough road factor
    const timeFactor = duration.value / route.duration.value; // relative time factor
  
    return (roughRoadFactor + timeFactor) / 2;
  };
  