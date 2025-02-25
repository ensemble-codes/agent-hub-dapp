"use client";
import { useState } from "react";

const StarRating = () => {
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [selectedRating, setSelectedRating] = useState<number>(0);

  const handleMouseEnter = (rating: number) => {
    setHoveredRating(rating);
  };

  const handleMouseLeave = () => {
    setHoveredRating(0);
  };

  const handleClick = (rating: number) => {
    setSelectedRating(rating);
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((rating) => (
        <img
          key={rating}
          src={`/assets/${
            rating <= (hoveredRating || selectedRating) ? "star" : "empty-star"
          }-icon.svg`}
          alt="star"
          className="w-4 h-4 cursor-pointer"
          onMouseEnter={() => handleMouseEnter(rating)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(rating)}
        />
      ))}
    </div>
  );
};

export default StarRating; 
