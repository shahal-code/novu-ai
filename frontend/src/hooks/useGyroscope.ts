import { useState, useEffect } from 'react';

export function useGyroscope() {
  const [tiltX, setTiltX] = useState(0);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const gamma = event.gamma || 0; // Left-to-right tilt in degrees (-90 to 90)
      
      // Reduce sensitivity by multiplying by a fraction (e.g., 0.3) so it feels much slower and smoother
      const smoothedGamma = gamma * 0.3;
      
      // Limit rotation to -15 to +15 degrees for a subtle water sloshing effect
      const clampedGamma = Math.max(-15, Math.min(15, smoothedGamma));
      
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
