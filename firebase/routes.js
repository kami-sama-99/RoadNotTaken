import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

// Fetch polycoded routes for a specific user from the Firestore database
export const fetchUserRoutesFromFirestore = async () => {
  const userUid = "8hE2JqLyCPUqjg1dLEGyMduy3Pl2"; // Hardcoded user UID

  try {
    // Accessing the routes collection for the specific user
    const routesSnapshot = await getDocs(collection(db, "users", userUid, "routes"));

    if (routesSnapshot.empty) {
      console.log("No routes found for this user.");
      return []; // Return an empty array if no routes are found
    }

    // Extracting all the encodedPolyline values for the user's routes
    const userRoutes = routesSnapshot.docs.map((doc) => doc.data().encodedPolyline);
 // Log the fetched routes
    return userRoutes; // Return the user's routes
  } catch (error) {
    console.error("Error fetching routes for user:", error);
    return []; // Return an empty array in case of an error
  }
};

// Call the function to fetch routes for the hardcoded user
fetchUserRoutesFromFirestore();
