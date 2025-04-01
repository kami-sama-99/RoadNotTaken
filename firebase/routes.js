import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

// Fetch all polycoded routes from the Firestore database
export const fetchAllRoutesFromFirestore = async () => {
  try {
    let allRoutes = [];

    // Query the 'routes' collection to get all route documents
    const routesSnapshot = await getDocs(collection(db, "routes"));

    // Loop through each route document
    routesSnapshot.forEach((doc) => {
      // Extract the encodedPolyline values for each route
      const routeData = doc.data();
      const encodedPolyline = routeData.encodedPolyline;

      // Add the route to the array
      allRoutes.push(encodedPolyline);
    });

    // Log the fetched routes for all users
    console.log("Fetched routes for all users:", allRoutes);
    return allRoutes; // Return the routes array for further processing or use
  } catch (error) {
    console.error("Error fetching routes for all users:", error);
    return []; // Return an empty array in case of an error
  }
};
