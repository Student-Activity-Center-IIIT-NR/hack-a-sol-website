import { motion } from 'framer-motion';
import '../styles/AboutSection.css';

const AboutSection = () => {
  return (
    <section id="about" className="about-section">

      {/* Main content section with bold typography */}
      <div className="main-content">
        <div className="driver-stats">
          <div className="driver-info">
          </div>
          <div className="driver-info">
            <span className="driver-name">Hack-A-Sol is the flagship annual hackathon of IIIT-Naya Raipur (IIIT-NR). </span>
            <span className="driver-name">48 hours of coding, designing, and building.</span>
            <span className="driver-name">More than just a competition, Hack-A-Sol fosters a hands-on ecosystem where teams address real-world challenges, experiment with ideas, and build impactful solutions.</span>
          </div>
        </div>

        <motion.div
          className="motivation-text"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;