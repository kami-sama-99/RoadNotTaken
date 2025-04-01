"use client";

import Header from "../components/Header";
import MapComponent from "../components/Map";

const MapPage = () => {
  return (
    <>
      <Header />
      <div className="h-screen p-4 h-fit flex flex-col md:grid md:grid-cols-3 md:gap-4">
        {/* Left Section (Legend) */}
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
        </div>

        {/* Right Section (Map) */}
        <div className="md:col-span-2 mt-4 md:mt-0 rounded-lg shadow-md overflow-hidden h-fit">
          <MapComponent />
        </div>
      </div>
    </>
  );
};

export default MapPage;
