import { cookies } from "next/headers"; // Import cookies correctly

export async function POST() {
  const cookieStore = await cookies(); // Await cookies() before using it
  cookieStore.delete("session"); // Delete the session cookie

  return Response.json({ message: "Logged out" });
}
