import { motion } from 'framer-motion';
import '../styles/AboutSection.css';

const AboutSection = () => {
  return (
    <section id="about" className="about-section">
      {/* Top section with race results style */}
      <div className="race-results-header">
        <div className="race-info">
          <span className="race-label">RACE RESULTS</span>
          <span className="position-number">P2</span>
        </div>
        <div className="driver-helmet">
          <img 
            src="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop"
            alt="F1 Driver Helmet"
            className="helmet-image"
          />
        </div>
      </div>

      {/* Main content section with bold typography */}
      <div className="main-content">
        <div className="driver-stats">
          <div className="driver-info">
            <span className="driver-name">HACK-A-SOL PARTICIPANTS</span>
            <span className="driver-time">02:46:37</span>
          </div>
          <div className="driver-info">  
            <span className="driver-name">DEVELOPMENT TEAMS</span>
            <span className="driver-time">48 HOURS</span>
          </div>
        </div>

        <motion.div 
          className="motivation-text"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <p>We keep pushing forward for our dream</p>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;