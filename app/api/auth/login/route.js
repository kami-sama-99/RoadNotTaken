import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import { adminAuth } from "@/firebase/firebaseAdmin"; // Initialize Firebase Admin SDK

export async function POST(req) {
  try {
    const { idToken } = await req.json();
    
    // Verify the Firebase ID Token
    const decodedToken = await getAuth(adminAuth).verifyIdToken(idToken);

    // Set session cookie
    const sessionCookie = await getAuth(adminAuth).createSessionCookie(idToken, {
      expiresIn: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    cookies().set("session", sessionCookie, { httpOnly: true, secure: true, maxAge: 604800 });

    return Response.json({ uid: decodedToken.uid, email: decodedToken.email });
  } catch (error) {
    return Response.json({ error: "Authentication failed" }, { status: 401 });
  }
}
