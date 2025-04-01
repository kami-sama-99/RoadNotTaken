'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import AuthForm from "../components/AuthForm";

export default function Page({ params }) {
  const [mode, setMode] = useState(null);

  useEffect(() => {
    async function fetchParams() {
      const unwrappedParams = await params; // Wait for params to be resolved
      setMode(unwrappedParams.mode); // Set the mode value
    }

    fetchParams(); // Fetch and unwrap params
  }, [params]); // Dependency array to re-run when params change

  // Loading state until mode is resolved
  if (mode === null) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center p-4">
      <div className="w-full max-w-[1200px] grid lg:grid-cols-2 gap-8">
        <div className="space-y-6 max-w-[400px]">
          <div className="space-y-2">
            <h1 className="text-3xl font-medium">
              {mode === "signup" ? "Create an account" : "Sign in to your account"}
            </h1>
            <p className="text-gray-600">
              {mode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
              <Link
                href={mode === "signup" ? "/signin" : "/signup"}
                className="text-blue-500 hover:underline"
              >
                {mode === "signup" ? "Sign in" : "Sign up"}
              </Link>
            </p>
          </div>
          <AuthForm mode={mode} />
        </div>

        <div className="hidden lg:block">
          <div className="h-full w-full rounded-[2rem] border border-gray-300"></div>
        </div>
      </div>
    </div>
  );
}
