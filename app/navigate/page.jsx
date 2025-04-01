"use client";
import { useState, useEffect, useRef } from "react";
import NavigationMap from "../components/NavigationMap";
import Header from "../components/Header";
import { useGoogleMaps } from "@/context/GoogleMapsContext"; // Import the context hook

export default function Page() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [isStartFocused, setIsStartFocused] = useState(false);
  const [isEndFocused, setIsEndFocused] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Store error messages
  const [navigateClicked, setNavigateClicked] = useState(false); // Track if navigate button is clicked

  const startInputRef = useRef(null);
  const endInputRef = useRef(null);

  // Get Google Maps API loaded state from context
  const { isGoogleMapsLoaded } = useGoogleMaps();

  // Handle start location input change and fetch predictions
  const handleStartChange = (e) => {
    const value = e.target.value;
    setStart(value);
    if (value.length > 0 && isGoogleMapsLoaded) {
      const autocompleteService = new window.google.maps.places.AutocompleteService();
      autocompleteService.getPlacePredictions({ input: value }, (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setStartSuggestions(predictions);
        } else {
          setStartSuggestions([]);
        }
      });
    } else {
      setStartSuggestions([]);
    }

    // Reset the navigation if start location changes after navigating
    if (navigateClicked) {
      setNavigateClicked(false); // Allow the user to modify destinations after navigating
    }
  };

  // Handle end location input change and fetch predictions
  const handleEndChange = (e) => {
    const value = e.target.value;
    setEnd(value);
    if (value.length > 0 && isGoogleMapsLoaded) {
      const autocompleteService = new window.google.maps.places.AutocompleteService();
      autocompleteService.getPlacePredictions({ input: value }, (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setEndSuggestions(predictions);
        } else {
          setEndSuggestions([]);
        }
      });
    } else {
      setEndSuggestions([]);
    }

    // Reset the navigation if end location changes after navigating
    if (navigateClicked) {
      setNavigateClicked(false); // Allow the user to modify destinations after navigating
    }
  };

  // Select a suggestion and set it to the corresponding input field
  const handleSelectStart = (suggestion) => {
    setStart(suggestion.description);
    setStartSuggestions([]);
  };

  const handleSelectEnd = (suggestion) => {
    setEnd(suggestion.description);
    setEndSuggestions([]);
  };

  // Handle the Navigate button click
  const handleNavigate = () => {
    if (!start || !end) {
      setErrorMessage("Both start and end locations must be filled out.");
      return;
    }

    if (start === end) {
      setErrorMessage("Start and end locations cannot be the same.");
      return;
    }

    setErrorMessage(""); // Clear error message if inputs are valid
    setNavigateClicked(true); // Set the flag to true when "Navigate" is clicked
  };

  // Render input fields, suggestions, and error message
  return (
    <>
      <Header />
      <div className="h-screen p-4 flex flex-col md:grid md:grid-cols-3 md:gap-4 text-black">
        <div className="md:col-span-1 text-black bg-gray-100 p-4 rounded-lg shadow-md h-fit">
          <h2 className="text-xl text-black font-bold mb-4">Enter Navigation Details</h2>

          <div className="relative">
            <input
              ref={startInputRef}
              type="text"
              placeholder="Enter Start Location"
              value={start}
              onChange={handleStartChange}
              onFocus={() => setIsStartFocused(true)}
              onBlur={() => setIsStartFocused(false)}
              className="w-full p-3 my-3 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {isStartFocused && startSuggestions.length > 0 && (
              <ul className="absolute w-full mt-1 bg-white shadow-lg rounded-lg max-h-60 overflow-y-auto z-10">
                {startSuggestions.map((suggestion) => (
                  <li
                    key={suggestion.place_id}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-200"
                    onMouseDown={() => handleSelectStart(suggestion)}
                  >
                    {suggestion.description}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative">
            <input
              ref={endInputRef}
              type="text"
              placeholder="Enter End Location"
              value={end}
              onChange={handleEndChange}
              onFocus={() => setIsEndFocused(true)}
              onBlur={() => setIsEndFocused(false)}
              className="w-full p-3 my-3 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {isEndFocused && endSuggestions.length > 0 && (
              <ul className="absolute w-full mt-1 bg-white shadow-lg rounded-lg max-h-60 overflow-y-auto z-10">
                {endSuggestions.map((suggestion) => (
                  <li
                    key={suggestion.place_id}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-200"
                    onMouseDown={() => handleSelectEnd(suggestion)}
                  >
                    {suggestion.description}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Display error message if there is one */}
          {errorMessage && <div className="text-red-500 mt-2">{errorMessage}</div>}

          {/* Navigate button */}
          <button
            onClick={handleNavigate}
            className="w-full mt-4 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
          >
            Navigate
          </button>
        </div>

        {/* Render NavigationMap only after clicking "Navigate" and if no error */}
        {navigateClicked && !errorMessage && <NavigationMap start={start} end={end} />}
      </div>
    </>
  );
}
