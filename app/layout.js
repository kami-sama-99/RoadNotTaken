import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { GoogleMapsProvider } from "@/context/GoogleMapsContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "RoadNotTaken",
  description: "Smooth roads ahead",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <GoogleMapsProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </GoogleMapsProvider>
      </body>
    </html>
  );
}
