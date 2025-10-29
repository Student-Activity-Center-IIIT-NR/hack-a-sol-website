import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import '../styles/ThemesSection.css';

const ThemesSection = () => {
  const [activeSection, setActiveSection] = useState(0);
  
  const sections = [
    {
      id: 'HOME',
      title: 'HACK-A-SOL',
      subtitle: 'HACKATHON',
      number: '01',
      description: 'Welcome to the ultimate 48-hour coding challenge. Join hundreds of developers, designers, and innovators as they transform ideas into reality. This is where passion meets competition.',
      image: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=600&h=800&fit=crop'
    },
    {
      id: 'RACES',
      title: 'CODING',
      subtitle: 'CHALLENGES',
      number: '02',  
      description: 'Four intense tracks await: Web Development, Mobile Apps, AI/ML Solutions, and Blockchain Innovation. Choose your battlefield and race against time to build the next breakthrough technology.',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=800&fit=crop'
    },
    {
      id: 'TEAM',
      title: 'DREAM',
      subtitle: 'TEAM',
      number: '03',
      description: 'Form your ultimate squad of developers, designers, and strategists. Collaborate with the brightest minds, share expertise, and push the boundaries of what\'s possible in just 48 hours.',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=800&fit=crop'
    },
    {
      id: 'NEWS',
      title: 'VICTORY',
      subtitle: 'PODIUM',
      number: '04',
      description: 'Compete for $100K+ in prizes, mentorship opportunities, and startup funding. Present your innovations to industry leaders and claim your spot on the winners\' podium.',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=800&fit=crop'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSection((prev) => (prev + 1) % sections.length);
    }, 4000); // Switch every 4 seconds

    return () => clearInterval(interval);
  }, [sections.length]);

  const currentSection = sections[activeSection];

  return (
    <section id="themes" className="themes-section">
      {/* Navigation */}
      <div className="themes-nav">
        <div className="nav-items">
          {sections.map((section, index) => (
            <span 
              key={section.id}
              className={`nav-item ${index === activeSection ? 'active' : ''}`}
              onClick={() => setActiveSection(index)}
            >
              {section.id}
            </span>
          ))}
        </div>
      </div>

      {/* Main content with split layout */}
      <div className="themes-content">
        {/* Left side with text */}
        <div className="content-left">
          <div className="ferrari-logo">
            <div className="prancing-horse">🏎️</div>
          </div>

          <motion.h1 
            key={activeSection}
            className="driver-name"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="name-charles">{currentSection.title}</span><br/>
            <span className="name-leclerc">{currentSection.subtitle}</span>
          </motion.h1>

          <motion.div 
            key={`number-${activeSection}`}
            className="driver-number"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {currentSection.number}
          </motion.div>

          <motion.div 
            key={`story-${activeSection}`}
            className="driver-story"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <p>{currentSection.description}</p>
          </motion.div>

          {/* Progress indicators */}
          <div className="progress-indicators">
            {sections.map((_, index) => (
              <div 
                key={index}
                className={`progress-dot ${index === activeSection ? 'active' : ''}`}
                onClick={() => setActiveSection(index)}
              />
            ))}
          </div>
        </div>

        {/* Right side with driver image */}
        <motion.div 
          key={`image-${activeSection}`}
          className="content-right"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <div className="driver-image-container">
            <img 
              src={currentSection.image}
              alt={currentSection.title}
              className="driver-image"
            />
          </div>
        </motion.div>
      </div>

      {/* Auto-play progress bar */}
      <div className="auto-progress">
        <motion.div 
          className="progress-bar"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 4, ease: "linear", repeat: Infinity }}
          key={activeSection}
        />
      </div>
    </section>
  );
};

export default ThemesSection;