'use client';

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/firebase/firebase";
import { useState, useRef, useEffect } from "react";
import { FaGoogle } from "react-icons/fa";

export default function AuthForm({ mode }) {
  const email = useRef();
  const password = useRef();
  const confirmPassword = useRef();
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Adjust 768px as per your design
    };

    handleResize(); // Check screen size on mount

    window.addEventListener("resize", handleResize); // Listen for screen size changes

    return () => {
      window.removeEventListener("resize", handleResize); // Cleanup listener on unmount
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === "signup") {
        if (password.current.value !== confirmPassword.current.value) {
          setError("Passwords do not match.");
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email.current.value,
          password.current.value
        );
        const user = userCredential.user;
        await sendEmailVerification(user);
        await signOut(auth);
        setInfo("Verification email sent! Please verify your email to continue.");
      } else if (mode === "signin") {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email.current.value,
          password.current.value
        );

        if (!userCredential.user.emailVerified) {
          setError("Please verify your email before logging in.");
          await signOut(auth);
        } else {
            alert("Successful sign in")
        }
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleOAuthSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      alert("Successful sign in")
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white text-black p-6 rounded-lg shadow-md">
      <p className="text-red-500">{error}</p>
      <p className="text-green-500">{info}</p>

      <input
        name="email"
        type="email"
        placeholder="Email"
        ref={email}
        className="bg-gray-100 text-black h-12 w-full rounded-md px-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        ref={password}
        className="bg-gray-100 text-black h-12 w-full rounded-md px-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      {mode === "signup" && (
        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          ref={confirmPassword}
          className="bg-gray-100 text-black h-12 w-full rounded-md px-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      )}

      <button
        type="submit"
        className="w-full h-12 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        {mode === "signin" ? "Sign in" : "Sign up"}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">OR REGISTER WITH</span>
        </div>
      </div>

      <button
        type="button"
        className="flex w-full items-center justify-center h-12 px-4 border border-gray-300 rounded-md bg-gray-100 hover:bg-gray-200"
        onClick={handleOAuthSignIn}
      >
        <FaGoogle className="mr-2 h-4 w-4 text-red-500" />
        Google
      </button>

      {/* Only show the right div for desktop, hide on mobile */}
      {!isMobile && (
        <div className="hidden lg:block">
          <div className="h-full w-full rounded-[2rem] border border-gray-300"></div>
        </div>
      )}
    </form>
  );
}
