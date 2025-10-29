import { motion, useScroll, useTransform } from 'framer-motion';
import { TiLocationArrow } from "react-icons/ti";
import { useEffect, useRef, useState } from "react";
import Button from './ui/Button';
import '../styles/HeroSection.css';

const HeroSection = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Transform scroll progress for parallax effects
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.3]);

  const videos = [
    { src: "/video/loading.mp4", label: "Formula 1 Racing" },
    { src: "/video/loading.mp4", label: "Technology" },
    { src: "/video/loading.mp4", label: "Innovation" }
  ];

  // Auto-switch videos every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [videos.length]);

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
  };

  const scrollToNextSection = () => {
    document.getElementById('about')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <div ref={containerRef} className="hero-section">
      {/* Video Background */}
      <motion.div 
        className="hero-video-container"
        style={{ y, opacity }}
      >
        <video
          ref={videoRef}
          key={currentVideoIndex}
          autoPlay
          muted
          loop
          playsInline
          className="hero-video"
          onLoadedData={handleVideoLoad}
        >
          <source src={videos[currentVideoIndex].src} type="video/mp4" />
        </video>
        
        {/* Video Overlay */}
        <div className="hero-video-overlay" />
        
        {/* Loading State */}
        {!isVideoLoaded && (
          <div className="hero-video-loading">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Hero Content */}
      <div className="hero-content">
        <div className="hero-container">
          
          {/* Main Title */}
          <motion.div 
            className="hero-title-container"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          >
            <h1 className="hero-title">
              <span className="title-line">
                <span className="title-word">HACK</span>
                <span className="title-separator">-</span>
                <span className="title-word title-word--accent">A</span>
                <span className="title-separator">-</span>
                <span className="title-word">SOL</span>
              </span>
              <span className="title-line title-line--sub">
                <span className="title-subtext">F1 HACKATHON</span>
              </span>
            </h1>
          </motion.div>

          {/* Subtitle and Description */}
          <motion.div 
            className="hero-description"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <p className="hero-subtitle">
              48 Hours of Pure Innovation
            </p>
            <p className="hero-tagline">
              Where Formula 1 speed meets cutting-edge technology. 
              Build the future of racing, one line of code at a time.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            className="hero-actions"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <Button 
              variant="racing" 
              size="lg"
              icon={<TiLocationArrow size={20} />}
              iconPosition="right"
            >
              Register Now
            </Button>
            
            <Button 
              variant="secondary" 
              size="lg"
              onClick={scrollToNextSection}
            >
              Learn More
            </Button>
          </motion.div>

          {/* Event Info */}
          <motion.div 
            className="hero-info"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.5 }}
          >
            <div className="info-item">
              <span className="info-label">Date</span>
              <span className="info-value">Dec 15-17, 2024</span>
            </div>
            <div className="info-separator"></div>
            <div className="info-item">
              <span className="info-label">Location</span>
              <span className="info-value">Virtual & Boston</span>
            </div>
            <div className="info-separator"></div>
            <div className="info-item">
              <span className="info-label">Prizes</span>
              <span className="info-value">$100K+</span>
            </div>
          </motion.div>
        </div>

        {/* Racing Elements */}
        <div className="hero-racing-elements">
          {/* Speed Lines */}
          <motion.div 
            className="speed-lines"
            animate={{ 
              x: ["-100%", "100%"],
              opacity: [0, 1, 0] 
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut"
            }}
          />
          
          {/* Racing Numbers */}
          <motion.div 
            className="racing-number"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 2 }}
          >
            <span>01</span>
          </motion.div>
        </div>
      </div>

      {/* Video Indicators */}
      <motion.div 
        className="video-indicators"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 1.8 }}
      >
        {videos.map((video, index) => (
          <button
            key={index}
            className={`video-indicator ${index === currentVideoIndex ? 'active' : ''}`}
            onClick={() => setCurrentVideoIndex(index)}
            title={video.label}
          >
            <div className="indicator-line"></div>
            <span className="indicator-label">{video.label}</span>
          </button>
        ))}
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        className="scroll-indicator"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 2.5 }}
        onClick={scrollToNextSection}
      >
        <motion.div
          className="scroll-arrow"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ↓
        </motion.div>
        <span>Scroll to explore</span>
      </motion.div>
    </div>
  );
};

export default HeroSection;