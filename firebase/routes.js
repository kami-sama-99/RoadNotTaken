import { getFirestore, collection, getDocs } from "firebase/firestore";

// Fetch all polycoded routes for every user in the Firestore database
export const fetchAllRoutesFromFirestore = async () => {
  const db = getFirestore();

  try {
    // Accessing the users collection
    const usersSnapshot = await getDocs(collection(db, "users"));
    console.log("Users Snapshot:", usersSnapshot);  // Log the users snapshot to check

    if (usersSnapshot.empty) {
      console.log("No users found in the database.");
      return [];  // Return an empty array if no users are found
    }

    // Iterate over all users and fetch their routes
    const allRoutes = [];
    
    for (const userDoc of usersSnapshot.docs) {
      const userUid = userDoc.id;  // The user's UID is the document ID

      // Fetch the routes for the current user
      const routesSnapshot = await getDocs(collection(db, "users", userUid, "routes"));
      console.log(`Routes Snapshot for user ${userUid}:`, routesSnapshot);  // Log the snapshot for each user

      if (!routesSnapshot.empty) {
        const userRoutes = routesSnapshot.docs.map(doc => doc.data().encodedPolyline);
        allRoutes.push(...userRoutes);  // Add the routes to the allRoutes array
      }
    }

    console.log("Fetched All Routes:", allRoutes);  // Log all fetched routes
    return allRoutes;  // Return the array of all routes
  } catch (error) {
    console.error("Error fetching routes from Firestore:", error);
    return [];  // Return an empty array in case of an error
  }
};
