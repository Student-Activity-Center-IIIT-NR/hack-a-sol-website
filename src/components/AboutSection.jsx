import { motion } from 'framer-motion';
import ScrollBaseAnimation from './ui/ScrollBaseAnimation';
import '../styles/AboutSection.css';

const AboutSection = () => {
  return (
    <section id="about" className="about-section">
      {/* Full width hero image */}
      <div className="about-hero-image">
        <img 
          src="/images/GnYsQtxWMAEXOJk.jpg"
          alt="Hack-a-Sol Event"
          className="hero-image"
        />
      </div>

      {/* Main content section with scrolling text animation */}
      <div className="main-content">
        {/* Scrolling Text Animation */}
        <div className="scrolling-text-content">
          <ScrollBaseAnimation
            delay={500}
            baseVelocity={-5}
            clasname='text-black'
          >
            HACK-A-SOL PARTICIPANTS&nbsp;&nbsp;&nbsp;
          </ScrollBaseAnimation>
          <ScrollBaseAnimation
            delay={500}
            baseVelocity={3}
            clasname='text-black'
          >
            DEVELOPMENT TEAMS&nbsp;&nbsp;&nbsp;
          </ScrollBaseAnimation>
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