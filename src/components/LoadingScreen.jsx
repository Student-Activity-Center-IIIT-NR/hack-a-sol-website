import React from 'react';
import '../styles/LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="background-video"
      >
        <source src="/video/loading.mp4" type="video/mp4" />
      </video>
      
      {/* Fallback background */}
      <div className="video-fallback">
        <div className="animated-background"></div>
      </div>

      {/* Black overlay */}
      <div className="black-overlay"></div>
      
      {/* Simple centered loading text */}
      <div className="text-layer">
        <div className="text-cutout">
          <div className="location-name">loading</div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;