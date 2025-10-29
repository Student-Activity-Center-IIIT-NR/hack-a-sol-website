import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import '../styles/LoadingScreen.css';

const LoadingScreen = () => {
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);
  const [showTitle, setShowTitle] = useState(false);

  const raceLocations = [
    { name: 'Monaco', year: '2024' },
    { name: 'Silverstone', year: '2024' },
    { name: 'Monza', year: '2024' },
    { name: 'Spa', year: '2024' },
    { name: 'Suzuka', year: '2024' }
  ];

  useEffect(() => {
    // Start showing locations after 500ms delay
    const startTimer = setTimeout(() => {
      const showLocation = (index) => {
        if (index >= raceLocations.length) return;
        
        setCurrentLocationIndex(index);
        
        // Show location for 1.5 seconds, then hide and show next
        setTimeout(() => {
          setCurrentLocationIndex(-1); // Hide current location
          
          // After 300ms gap, show next location
          setTimeout(() => {
            showLocation(index + 1);
          }, 300);
        }, 1500);
      };
      
      showLocation(0);
    }, 500);

    return () => {
      clearTimeout(startTimer);
    };
  }, []);

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
      
      {/* Text that cuts holes in the overlay */}
      <div className="text-layer">
        <AnimatePresence mode="wait">
          {currentLocationIndex >= 0 && (
            <motion.div
              key={currentLocationIndex}
              className="text-cutout"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <div className="location-name">
                {raceLocations[currentLocationIndex]?.name}
              </div>
              <div className="location-year">
                {raceLocations[currentLocationIndex]?.year}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LoadingScreen;