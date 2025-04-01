import { useState, useEffect } from "react";
import { Menu, MapPin, X } from "lucide-react";
import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext"; // Assuming you're using an AuthContext

export default function Header() {
  const { user } = useAuth(); // Get user authentication status
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  const menuItems = user
    ? [
        { name: "Home", href: "/" },
        { name: "Report", href: "/report" },
        { name: "Navigate", href: "navigate" },
        { name: "View map", href: "/map" },
        { name: "Profile", href: "/profile" },
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
          </nav>
        </div>
      </div>
    </>
  );
}
