import { cookies } from "next/headers";

export async function POST() {
  cookies().delete("session");
  return Response.json({ message: "Logged out" });
}
