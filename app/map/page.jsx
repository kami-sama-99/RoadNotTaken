"use client";

import React, { useState } from "react";
import Header from "../components/Header";
import MapComponent from "../components/Map";

const MapPage = () => {
  const [searchLocation, setSearchLocation] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [latLng, setLatLng] = useState(null); // State to store the LatLngLiteral

  // Handle input change for location search
  const handleLocationChange = (e) => {
    const value = e.target.value;
    setSearchLocation(value);
    // Clear suggestions if input is cleared
    if (value.length === 0) {
      setSuggestions([]);
    } else {
      // Fetch suggestions if the input is not empty
      fetchPlaceSuggestions(value);
    }
  };

  // Fetch place suggestions from the Places API
  const fetchPlaceSuggestions = (input) => {
    const service = new window.google.maps.places.AutocompleteService();
    service.getPlacePredictions(
      { input },
      (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setSuggestions(predictions);
        } else {
          setSuggestions([]);
        }
      }
    );
  };

  // Select a place suggestion and update the search input
  const handleSelectPlace = (place) => {
    setSearchLocation(place.description);
    setSuggestions([]); // Clear suggestions after selection
    setSelectedLocation(place.description); // Store selected location
    geocodeLocation(place.description); // Geocode the selected place
  };

  // Geocode the location to get latitude and longitude
  const geocodeLocation = (address) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === window.google.maps.GeocoderStatus.OK) {
        const latLng = results[0].geometry.location;
        setLatLng({
          lat: latLng.lat(),
          lng: latLng.lng(),
        });
      } else {
        console.error("Geocoding failed: " + status);
      }
    });
  };

  // Handle search button click to submit location
  const handleSearch = () => {
    if (searchLocation && !selectedLocation) {
      setSelectedLocation(searchLocation); // Set the searchLocation as selected location if not already set
      geocodeLocation(searchLocation); // Geocode the search location
    }
  };

  return (
    <>
      <Header />
      <div className="h-screen p-4 h-fit flex flex-col md:grid md:grid-cols-3 md:gap-4">
        {/* Left Section (Legend and Search Input) */}
        <div className="md:col-span-1 text-black bg-gray-100 p-4 rounded-lg shadow-md h-fit">
          <h2 className="text-xl text-black font-bold mb-4">Road Condition Index</h2>
          <p className="text-black mb-4">
            The roads are color-coded based on their condition.
          </p>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-6 h-6 bg-green-500 inline-block mr-2 rounded"></span>
              <span>Good Roads</span>
            </div>
            <div className="flex items-center">
              <span className="w-6 h-6 bg-yellow-500 inline-block mr-2 rounded"></span>
              <span>Moderate Roads</span>
            </div>
            <div className="flex items-center">
              <span className="w-6 h-6 bg-red-500 inline-block mr-2 rounded"></span>
              <span>Poor Roads</span>
            </div>
          </div>

          {/* Location Search Input */}
          <div className="mt-6">
            <input
              type="text"
              placeholder="Search for a location"
              value={searchLocation}
              onChange={handleLocationChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {/* Show suggestions if available */}
            {suggestions.length > 0 && (
              <ul className="absolute w-full mt-1 bg-white shadow-lg rounded-lg max-h-60 overflow-y-auto z-10">
                {suggestions.map((place) => (
                  <li
                    key={place.place_id}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSelectPlace(place)}
                  >
                    {place.description}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="mt-4 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all w-full"
          >
            Search Location
          </button>
        </div>

        {/* Right Section (Map) */}
        <div className="md:col-span-2 mt-4 md:mt-0 rounded-lg shadow-md overflow-hidden h-fit">
          {/* Pass LatLngLiteral to MapComponent */}
          {latLng && <MapComponent latLng={latLng} />}
        </div>
      </div>
    </>
  );
};

export default MapPage;
