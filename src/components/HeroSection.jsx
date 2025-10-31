'use client'
import Spline from '@splinetool/react-spline';
import React from 'react';

const HeroSection = () => {
  return (
    <main className="hero-root" style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <React.Suspense
        fallback={
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'black',
            }}
          >
            <span
              style={{
                color: '#fff',
                fontSize: '2rem',
                letterSpacing: '0.1em',
                fontFamily: 'Inter, sans-serif',
                opacity: 0.7,
              }}
            >
              Loading 3D Scene...
            </span>
          </div>
        }
      >
        <Spline
          scene="https://prod.spline.design/4cRiOBBI3XaqHCNQ/scene.splinecode"
          className="hero-spline"
          style={{ width: '100%', height: '100%' }}
        />
      </React.Suspense>
    </main>
  );
};

export default HeroSection;