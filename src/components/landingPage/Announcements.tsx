"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

const announcements = [
  {
    title: "dBKash Secures Funding of 100 CR!",
    image: "/1.png",
  },
  {
    title: "We're Hiring. Join our team!",
    image: "/2.png",
  },
  {
    title: "Exciting Offers Ahead!",
    image: "/3.png",
  },
  // ... add more announcements as needed
];

const Announcements: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePrevious = () => {
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + announcements.length) % announcements.length
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="max-w-6xl mx-4 md:mx-auto">
      <div className="text-3xl md:text-4xl text-center text-white font-extrabold mb-5 ">
        Announcments
      </div>
      <div className="relative overflow-hidden ">
        <div className="flex items-center justify-center ">
          <div className="">
            <Image
              src={announcements[currentIndex].image}
              alt={announcements[currentIndex].title}
              priority={true}
              width={700}
              height={250}
              className="object-cover"
            />
          </div>
        </div>
        <div className="p-4 text-center">
          <h2 className="text-xl font-bold text-white mb-2">
            {announcements[currentIndex].title}
          </h2>
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Learn More
          </button>
        </div>
      </div>

      <div className="flex justify-center items-center mt-4">
        <button onClick={handlePrevious} className="mx-2">
          {"<"}
        </button>
        {announcements.map((_, index) => (
          <span
            key={index}
            className={`w-3 h-3 rounded-full mx-1 ${
              index === currentIndex ? "bg-blue-500" : "bg-gray-300"
            }`}
          />
        ))}
        <button onClick={handleNext} className="mx-2">
          {">"}
        </button>
        <button onClick={togglePlay} className="ml-4">
          {isPlaying ? "❚❚" : "▶"}
        </button>
      </div>
    </div>
  );
};

export default Announcements;
