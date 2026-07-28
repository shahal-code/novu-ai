import { useState, useEffect } from 'react';

export function useGyroscope() {
  const [tiltX, setTiltX] = useState(0);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const gamma = event.gamma || 0; // Left-to-right tilt in degrees (-90 to 90)
      
      // Clamp the tilt so it doesn't flip completely upside down in a weird way
      // Limit rotation to -25 to +25 degrees for a realistic water sloshing effect
      const clampedGamma = Math.max(-25, Math.min(25, gamma));
      
      setTiltX(clampedGamma);
    };

    if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    
    return () => {
      if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, []);

  return { tiltX };
}
