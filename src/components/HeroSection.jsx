import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import { TiLocationArrow } from "react-icons/ti";
import { useEffect, useRef, useState } from "react";
import Button from './ui/Button';
import '../styles/HeroSection.css';

gsap.registerPlugin(ScrollTrigger);

const HeroSection = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const heroVideoRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const actionsRef = useRef(null);
  const infoRef = useRef(null);
  const racingElementsRef = useRef(null);

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

  // GSAP Animations
  useGSAP(() => {
    // Video container parallax effect
    gsap.to(heroVideoRef.current, {
      y: "50%",
      opacity: 0.3,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    // Clip path animation for video frame
    gsap.set(heroVideoRef.current, {
      clipPath: "polygon(14% 0, 72% 0, 88% 90%, 0 95%)",
      borderRadius: "0% 0% 40% 10%",
    });

    gsap.from(heroVideoRef.current, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      borderRadius: "0% 0% 0% 0%",
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: heroVideoRef.current,
        start: "center center",
        end: "bottom center",
        scrub: true,
      },
    });
  });

  // Initial animations on load
  useGSAP(() => {
    const tl = gsap.timeline();

    tl.from(titleRef.current, {
      opacity: 0,
      y: 100,
      duration: 1,
      ease: "power2.out",
    })
    .from(descriptionRef.current, {
      opacity: 0,
      y: 50,
      duration: 0.8,
    }, "-=0.2")
    .from(actionsRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.6,
    }, "-=0.2")
    .from(infoRef.current, {
      opacity: 0,
      duration: 0.6,
    }, "-=0.2")
    .from(racingElementsRef.current?.children, {
      opacity: 0,
      scale: 0,
      duration: 0.8,
      stagger: 0.2,
    }, "-=0.4");

    // Speed lines animation
    gsap.to(".speed-lines", {
      x: "200%",
      opacity: 0,
      duration: 2,
      repeat: -1,
      repeatDelay: 3,
      ease: "power2.inOut",
    });
  });

  return (
    <div ref={containerRef} className="hero-section">
      {/* Video Background */}
      <div 
        ref={heroVideoRef}
        className="hero-video-container"
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
      </div>

      {/* Hero Content */}
      <div className="hero-content">
        <div className="hero-container">
          
          {/* Main Title */}
          <div 
            ref={titleRef}
            className="hero-title-container"
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
          </div>

          {/* Subtitle and Description */}
          <div 
            ref={descriptionRef}
            className="hero-description"
          >
            <p className="hero-subtitle">
              48 Hours of Pure Innovation
            </p>
            <p className="hero-tagline">
              Where Formula 1 speed meets cutting-edge technology. 
              Build the future of racing, one line of code at a time.
            </p>
          </div>

          {/* CTA Buttons */}
          <div 
            ref={actionsRef}
            className="hero-actions"
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
          </div>

          {/* Event Info */}
          <div 
            ref={infoRef}
            className="hero-info"
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
          </div>
        </div>

        {/* Racing Elements */}
        <div ref={racingElementsRef} className="hero-racing-elements">
          {/* Speed Lines */}
          <div className="speed-lines" />
          
          {/* Racing Numbers */}
          <div className="racing-number">
            <span>01</span>
          </div>
        </div>
      </div>


    </div>
  );
};

export default HeroSection;