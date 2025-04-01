"use client";

import Header from "./Header";
import Hero from "./Hero";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Hero />
    </div>
  );
}
