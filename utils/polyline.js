export function decodePolyline(encoded) {
    let index = 0,
      lat = 0,
      lng = 0,
      coordinates = [];
  
    while (index < encoded.length) {
      let shift = 0,
        result = 0,
        byte;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      const deltaLat = (result & 1 ? ~(result >> 1) : result >> 1);
      lat += deltaLat;
  
      shift = 0;
      result = 0;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      const deltaLng = (result & 1 ? ~(result >> 1) : result >> 1);
      lng += deltaLng;
  
      coordinates.push({ lat: lat / 1e5, lng: lng / 1e5 });
    }
  
    return coordinates;
  }

  export function calculateOverlap(route, poorRoads) {
    let overlapLength = 0;
  
    for (let i = 0; i < route.length - 1; i++) {
      const segmentStart = route[i];
      const segmentEnd = route[i + 1];
  
      for (const poorRoute of poorRoads) {
        for (let j = 0; j < poorRoute.length - 1; j++) {
          const poorStart = poorRoute[j];
          const poorEnd = poorRoute[j + 1];
  
          if (segmentsOverlap(segmentStart, segmentEnd, poorStart, poorEnd)) {
            overlapLength += haversineDistance(segmentStart, segmentEnd);
          }
        }
      }
    }
  
    return overlapLength;
  }
  
  // Helper function to check if two line segments overlap (approximate method)
  function segmentsOverlap(a1, a2, b1, b2) {
    return (
      haversineDistance(a1, b1) + haversineDistance(a2, b2) <=
        haversineDistance(a1, a2) + haversineDistance(b1, b2) + 0.0001 // Tolerance
    );
  }
  
  // Helper function to calculate distance between two coordinates using Haversine formula
  function haversineDistance(coord1, coord2) {
    const R = 6371e3; // Earth radius in meters
    const toRadians = (degrees) => (degrees * Math.PI) / 180;
    const lat1 = toRadians(coord1.lat);
    const lat2 = toRadians(coord2.lat);
    const deltaLat = lat2 - lat1;
    const deltaLng = toRadians(coord2.lng - coord1.lng);
  
    const a =
      Math.sin(deltaLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c; // Distance in meters
  }
  