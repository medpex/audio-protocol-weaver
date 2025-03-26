
import React from 'react';

interface AnimatedTabIndicatorProps {
  activeIndex: number;
  itemCount: number;
}

const AnimatedTabIndicator: React.FC<AnimatedTabIndicatorProps> = ({ 
  activeIndex, 
  itemCount 
}) => {
  const getTransformValue = () => {
    return `translateX(${activeIndex * 100}%)`;
  };

  return (
    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-transparent">
      <div 
        className="absolute bottom-0 left-0 h-full bg-primary rounded-full tab-indicator"
        style={{ 
          width: `${100 / itemCount}%`, 
          transform: getTransformValue()
        }}
      />
    </div>
  );
};

export default AnimatedTabIndicator;
