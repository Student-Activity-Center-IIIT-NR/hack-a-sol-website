'use client'
import React, { useEffect, useState } from 'react';
import Spline from '@splinetool/react-spline';


const HeroSection = ({ onReady }) => {
  const [loaded, setLoaded] = useState(false);

  // notify parent when internal assets are loaded
  useEffect(() => {
    if (loaded && typeof onReady === 'function') {
      onReady();
    }
  }, [loaded, onReady]);

  return (
    <main className="hero-root" style={{ width: '100%', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <Spline
        scene="https://prod.spline.design/4cRiOBBI3XaqHCNQ/scene.splinecode"
        className="hero-spline"
        style={{ width: '100%', height: '100%' }}
        onLoad={() => setLoaded(true)} // triggers after scene loads
      />
    </main>
  );
};

export default HeroSection;
