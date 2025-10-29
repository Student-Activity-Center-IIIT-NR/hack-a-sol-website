import { motion } from 'framer-motion';
import '../styles/SponsorsSection.css';

const SponsorsSection = () => {
  return (
    <section id="sponsors" className="sponsors-section">
      {/* Navigation header */}
      <div className="sponsors-nav">
        <div className="nav-brand">
          <span className="brand-text">HACK-A-SOL</span>
        </div>
        <div className="nav-links">
          <span>SPONSORS</span>
          <span>PARTNERS</span>
          <span>MEDIA</span>
        </div>
      </div>

      {/* Main content */}
      <div className="sponsors-content">
        {/* Left side with text */}
        <div className="content-left">
          <motion.div 
            className="sponsors-title"
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <h1 className="massive-title">
              <span className="title-powered">POWERED</span>
              <span className="title-by">BY THE</span>
              <span className="title-best">BEST</span>
            </h1>
          </motion.div>

          <motion.div 
            className="sponsors-description"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <p>
              Industry leaders and innovative companies fuel our hackathon, 
              providing cutting-edge tools, mentorship, and opportunities 
              for the next generation of developers and creators.
            </p>
          </motion.div>

          <div className="sponsors-stats">
            <div className="stat-item">
              <span className="stat-number">25+</span>
              <span className="stat-label">SPONSORS</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">$100K+</span>
              <span className="stat-label">IN PRIZES</span>
            </div>
          </div>
        </div>

        {/* Right side with sponsor logos */}
        <motion.div 
          className="content-right"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <div className="sponsors-showcase">
            <div className="sponsor-tier title-tier">
              <div className="tier-label">TITLE SPONSORS</div>
              <div className="sponsor-logos-row">
                <div className="sponsor-logo-card major">
                  <div className="logo-placeholder">TECH<br/>CORP</div>
                </div>
                <div className="sponsor-logo-card major">
                  <div className="logo-placeholder">CLOUD<br/>TECH</div>
                </div>
              </div>
            </div>

            <div className="sponsor-tier gold-tier">
              <div className="tier-label">GOLD PARTNERS</div>
              <div className="sponsor-logos-grid">
                <div className="sponsor-logo-card medium">
                  <div className="logo-placeholder">AI SOL</div>
                </div>
                <div className="sponsor-logo-card medium">
                  <div className="logo-placeholder">DEV TOOLS</div>
                </div>
                <div className="sponsor-logo-card medium">
                  <div className="logo-placeholder">STARTUP HUB</div>
                </div>
                <div className="sponsor-logo-card medium">
                  <div className="logo-placeholder">SECURITY+</div>
                </div>
              </div>
            </div>

            <div className="sponsor-tier silver-tier">
              <div className="tier-label">SILVER & BRONZE</div>
              <div className="sponsor-logos-small">
                <div className="sponsor-logo-card small">WEB</div>
                <div className="sponsor-logo-card small">CODE</div>
                <div className="sponsor-logo-card small">DATA</div>
                <div className="sponsor-logo-card small">MOBILE</div>
                <div className="sponsor-logo-card small">GAME</div>
                <div className="sponsor-logo-card small">IOT</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* MLH Partnership footer */}
      <motion.div 
        className="mlh-footer"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="mlh-content">
          <div className="mlh-logo-container">
            <img 
              src="https://static.mlh.io/brand-assets/logo/official/mlh-logo-color.png" 
              alt="MLH"
              className="mlh-logo"
            />
          </div>
          <div className="mlh-text">
            <span>OFFICIAL MLH MEMBER EVENT</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default SponsorsSection;