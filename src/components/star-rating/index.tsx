"use client";
import { useState } from "react";
import { convertRatingToStars, convertStarsToRating } from "@/utils";

const StarRating = ({ onClick, rating = "0" }: { onClick?: (val: number) => void; rating?: string }) => {
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const numericRating = parseInt(rating, 10);
  const starRating = convertRatingToStars(numericRating);

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
      const newRating = convertStarsToRating(stars);
      onClick?.(newRating);
    }
  };

  const renderStar = (star: number) => {
    const currentRating = hoveredRating || starRating;
    const isFilled = star <= Math.floor(currentRating);
    const isPartial = !isFilled && star - 1 < currentRating;
    const partialFill = isPartial ? ((currentRating - (star - 1)) * 100) : 0;

    return (
      <div key={star} className="relative w-4 h-4">
        <img
          src="/assets/empty-star-icon.svg"
          alt="star"
          className={`w-4 h-4 ${numericRating === 0 ? "cursor-pointer" : ""}`}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(star)}
        />
        {isFilled && (
          <img
            src="/assets/star-icon.svg"
            alt="star"
            className="absolute top-0 left-0 w-4 h-4"
          />
        )}
        {isPartial && (
          <div 
            className="absolute top-0 left-0 overflow-hidden"
            style={{ width: `${partialFill}%` }}
          >
            <img
              src="/assets/star-icon.svg"
              alt="star"
              className="w-4 h-4"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(renderStar)}
    </div>
  );
};

export default StarRating;
