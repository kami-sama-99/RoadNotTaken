import { NextResponse } from "next/server";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";  // Import initialized Firebase here

export async function GET() {
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const puneLocations = [
    "Sinhagad Fort, Pune",
    "Katraj, Pune",
    "Dhankawadi, Pune",
    "Kondhwa, Pune",
    "Hadapsar, Pune",
    "Swargate, Pune",
    "Shivaji Nagar, Pune",
    "Deccan Gymkhana, Pune",
    "Fergusson College Road, Pune",
  ];


  try {
    for (let i = 0; i < puneLocations.length; i++) {
      for (let j = i + 1; j < puneLocations.length; j++) {
        const origin = puneLocations[i];
        const destination = puneLocations[j];

        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&alternatives=true&key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        for (const route of data.routes) {
          const encodedPolyline = route.overview_polyline.points;

          // Save the route directly to the 'routes' collection
          await addDoc(collection(db, "routes"), {
            origin,
            destination,
            encodedPolyline,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    return NextResponse.json({ message: "Routes stored successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
