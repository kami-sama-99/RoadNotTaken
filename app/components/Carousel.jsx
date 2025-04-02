import { useState, useEffect } from "react";
import Image from "next/image";

const images = [
  "/img1.jpg",
  "/images2.jpg",
  "/images/image3.jpg",
  "/images/image4.jpg",
];

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-[2rem]">
      {images.map((src, index) => (
        <Image
          key={index}
          src={src}
          alt={`Carousel Image ${index + 1}`}
          layout="fill"
          objectFit="cover"
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <span
            key={index}
            className={`block w-3 h-3 rounded-full transition-all duration-500 ${
              index === currentIndex ? "bg-white" : "bg-gray-500"
            }`}
          ></span>
        ))}
      </div>
    </div>
  );
}
