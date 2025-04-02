"use client"

import { useState, useEffect } from "react";
import { Menu, MapPin, X, User, LogOut } from "lucide-react";
import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext"; // Assuming you're using an AuthContext
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user } = useAuth(); // Get user authentication status
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false); // Profile dropdown state
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogout = async () => {
    try {
      // Make a POST request to your API route to log out
      const response = await fetch("/api/auth/logout", {
        method: "POST", // Ensure you are sending a POST request
      });
  
      if (response.ok) {
        // After successful logout, redirect to sign-in page
        router.push("/signin");
      } else {
        console.error("Error logging out");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const menuItems = user
    ? [
        { name: "Home", href: "/" },
        { name: "Report", href: "/report" },
        { name: "Navigate", href: "navigate" },
      ]
    : [{ name: "Sign in", href: "/signin" }];

  return (
    <>
      <header className="bg-gray-100 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <MapPin className="h-6 w-6 text-blue-500" />
          <span className="ml-2 font-bold text-blue-500">RoadNotTaken</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-gray-700 hover:text-blue-500 transition-colors"
            >
              {item.name}
            </Link>
          ))}

          {/* Profile Dropdown */}
          {user && (
            <div className="relative">
              <button
                onClick={toggleProfileDropdown}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-500"
              >
                <User className="h-5 w-5" />
                <span>{user.displayName || "Profile"}</span>
              </button>
              {isProfileDropdownOpen && (
                <div className="absolute right-0 z-10 mt-2 bg-white shadow-md rounded-md w-40">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="inline mr-2" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        {isMobile && (
          <button
            onClick={toggleMenu}
            className="md:hidden text-gray-700 focus:outline-none"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <Menu className="h-6 w-6" />
          </button>
        )}
      </header>

      {/* Mobile Menu Slide-in */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <span className="font-bold text-blue-500">Menu</span>
            <button
              onClick={toggleMenu}
              className="text-gray-700 focus:outline-none"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col space-y-4">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-500 transition-colors py-2 border-b border-gray-100"
                onClick={toggleMenu}
              >
                {item.name}
              </Link>
            ))}
            {user && (
              <div className="space-y-2 mt-4">
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-500 w-full"
                >
                  <User className="h-5 w-5" />
                  <span>{user.displayName || "Profile"}</span>
                </button>
                {isProfileDropdownOpen && (
                  <div className="ml-8 space-y-2">
                    <Link
                      href="/profile"
                      className="block text-gray-700 hover:text-blue-500"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      View Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block text-gray-700 hover:text-blue-500"
                    >
                      <LogOut className="inline mr-2" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}
