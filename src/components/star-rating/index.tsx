"use client";
import { useState } from "react";

const StarRating = ({ onClick, rating = "0" }: { onClick?: (val: number) => void; rating?: string }) => {
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const numericRating = parseInt(rating, 10);
  const starRating = numericRating === 0 ? 0 : Math.floor((numericRating / 25) + 1);

  const handleMouseEnter = (stars: number) => {
    if (numericRating === 0) {
      setHoveredRating(stars);
    }
  };

  const handleMouseLeave = () => {
    if (numericRating === 0) {
      setHoveredRating(0);
    }
  };

  const handleClick = (stars: number) => {
    if (numericRating === 0) {
      // Convert stars back to 0-100 scale
      const newRating = (stars - 1) * 25;
      onClick?.(newRating);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <img
          key={star}
          src={`/assets/${
            star <= (hoveredRating || starRating) ? "star" : "empty-star"
          }-icon.svg`}
          alt="star"
          className={`w-4 h-4 ${numericRating === 0 ? "cursor-pointer" : ""}`}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(star)}
        />
      ))}
    </div>
  );
};

export default StarRating;
