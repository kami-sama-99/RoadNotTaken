import Link from "next/link";
import { useEffect, useState } from "react";
import React from "react";

export default function Hero() {
  // Typewriter Component
  function Typewriter() {
    const phrases = [
      "Navigate smart. Avoid bad roads.",
      "Feel any bumps? Report them!",
      "Take control of your journey",
      "Smooth roads ahead with RoadNotTaken",
    ];

    const [displayText, setDisplayText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(100);

    const currentPhrase = phrases[currentPhraseIndex];
    const timeoutRef = React.useRef(null);

    useEffect(() => {
      const handleTyping = () => {
        // Current phrase being typed/deleted
        const phrase = phrases[currentPhraseIndex];

        // If deleting
        if (isDeleting) {
          setDisplayText(phrase.substring(0, displayText.length - 1));
          setTypingSpeed(50); // Faster when deleting

          // When fully deleted
          if (displayText === "") {
            setIsDeleting(false);
            setCurrentPhraseIndex(
              (prevIndex) => (prevIndex + 1) % phrases.length
            );
            setTypingSpeed(100);
          }
        }
        // If typing
        else {
          setDisplayText(phrase.substring(0, displayText.length + 1));

          // When fully typed
          if (displayText === phrase) {
            // Pause at the end of typing before deleting
            setTypingSpeed(2000);
            setIsDeleting(true);
          }
        }
      };

      // Set up the timeout for typing effect
      timeoutRef.current = setTimeout(handleTyping, typingSpeed);

      // Cleanup
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }, [displayText, isDeleting, currentPhraseIndex, typingSpeed, phrases]);

    return <div>{displayText || "\u00A0"}</div>;
  }
  return (
    <main className="flex-1 bg-white relative">
      <div
        className="w-full min-h-[500px] flex flex-col items-center justify-center px-4 py-12 relative"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6)), url('/HeroImage.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h1 className="text-4xl md:text-6xl font-bold text-blue-500 mb-6 text-center">
          RoadNotTaken
        </h1>

        <div className="text-xl md:text-2xl text-gray-700 mb-8 text-center h-12">
          <Typewriter />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/report"
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-8 rounded-md transition-colors text-center"
          >
            Report
          </Link>
          <Link
            href="/navigate"
            className="bg-blue-700 hover:bg-blue-800 text-white font-medium py-3 px-8 rounded-md transition-colors text-center"
          >
            Navigate
          </Link>
        </div>
      </div>
    </main>
  );
}
