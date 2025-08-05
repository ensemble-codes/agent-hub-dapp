'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScrollingTextProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
}

export const ScrollingText: React.FC<ScrollingTextProps> = ({
  text,
  className = '',
  speed = 20,
  delay = 2000
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollDistance, setScrollDistance] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const textElement = textRef.current;

    if (!container || !textElement) return;

    // Wait for next tick to ensure DOM is fully rendered
    const checkOverflow = () => {
      const containerWidth = container.offsetWidth;
      const textWidth = textElement.scrollWidth;
      
      console.log('Container width:', containerWidth, 'Text width:', textWidth, 'Text:', text);
      
      if (textWidth > containerWidth) {
        setShouldScroll(true);
        // Calculate the exact distance needed to scroll to show the end of the text
        // We want to scroll so that the end of the text is visible
        const distance = textWidth - containerWidth + 20; // Add 20px padding to show the end clearly
        setScrollDistance(distance);
        console.log('Should scroll: true, distance:', distance, 'textWidth:', textWidth, 'containerWidth:', containerWidth);
      } else {
        setShouldScroll(false);
        setScrollDistance(0);
        console.log('Should scroll: false');
      }
    };

    // Check immediately
    checkOverflow();
    
    // Also check after a small delay to ensure everything is rendered
    const timer = setTimeout(checkOverflow, 100);
    
    return () => clearTimeout(timer);
  }, [text]);

  useEffect(() => {
    if (!shouldScroll) return;

    const timer = setTimeout(() => {
      setIsScrolling(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [shouldScroll, delay]);

  return (
    <div 
      ref={containerRef}
      className={`overflow-hidden w-full ${className}`}
    >
              <div
          ref={textRef}
          className={`whitespace-nowrap ${
            shouldScroll && isScrolling
              ? 'animate-scroll-text'
              : ''
          }`}
          style={{
            animationDuration: shouldScroll ? `${speed}s` : '0s',
            animationDelay: `${delay}ms`,
            '--scroll-distance': `${scrollDistance}px`,
          } as React.CSSProperties}
        >
          {text}
        </div>
    </div>
  );
}; 