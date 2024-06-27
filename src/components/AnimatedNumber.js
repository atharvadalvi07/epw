/*import React, { useEffect, useState } from 'react';
import './index.css';

const AnimatedNumber = ({ value, duration = 1000 }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [animation, setAnimation] = useState('');

  useEffect(() => {
    if (isNaN(value) || value === null) {
      setDisplayValue(0);
      return;
    }

    if (displayValue !== value) {
      setAnimation(displayValue < value ? 'move-up' : 'move-down');
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setAnimation('');
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [value, duration, displayValue]);

  return (
    <div className="number-container">
      <div className={`number ${animation}`}>
        {displayValue}
      </div>
      <div className={`number ${animation}`} style={{ top: '100%' }}>
        {value}
      </div>
    </div>
  );
};

export default AnimatedNumber;*/

import React, { useEffect, useState } from 'react';

const animateValue = (start, end, duration, callback) => {
  if (start === end) {
    callback(end);
    return;
  }

  const range = end - start;
  const startTime = performance.now();
  
  const step = (currentTime) => {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / (duration * 10), 1);
    const current = start + range * progress;
    
    callback(current);
    
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      callback(end);
    }
  };
  
  requestAnimationFrame(step);
};

const AnimatedNumber = ({ value, duration = 1000 }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (isNaN(value) || value === null) {
      setDisplayValue(0);
      return;
    }
    animateValue(displayValue, value, duration, setDisplayValue);
  }, [value, duration]);

  return <span>{Math.round(displayValue)}</span>; 
};

export default AnimatedNumber;
