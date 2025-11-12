import { motion } from 'framer-motion';
import { Shield, Blocks, Brain, Scale, Lightbulb, Award } from 'lucide-react';
import '../styles/TracksSection.css';

const TracksSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const tracksData = [
    {
      icon: Blocks,
      title: 'Web3',
      description: 'Build decentralized applications and services using blockchain and Web3 technologies.',
      color: '#ff0000',
      gradient: 'linear-gradient(135deg, rgba(255, 0, 0, 0.2), rgba(255, 0, 0, 0.05))',
    },
    {
      icon: Shield,
      title: 'Cyber Security',
      description: 'Develop solutions to protect and secure digital information and systems.',
      color: '#cc0000',
      gradient: 'linear-gradient(135deg, rgba(204, 0, 0, 0.2), rgba(204, 0, 0, 0.05))',
    },
    {
      icon: Brain,
      title: 'AI/ML',
      description: 'Innovate with artificial intelligence and machine learning to solve complex problems.',
      color: '#ff3333',
      gradient: 'linear-gradient(135deg, rgba(255, 51, 51, 0.2), rgba(255, 51, 51, 0.05))',
    },
    {
      icon: Scale,
      title: 'Policy-Thon',
      description: 'Create technology-driven solutions to address and influence public policies.',
      color: '#990000',
      gradient: 'linear-gradient(135deg, rgba(153, 0, 0, 0.2), rgba(153, 0, 0, 0.05))',
    },
    {
      icon: Lightbulb,
      title: 'Open Innovation',
      description: 'Bring your most creative and original ideas to life in this free-form track.',
      color: '#ff6666',
      gradient: 'linear-gradient(135deg, rgba(255, 102, 102, 0.2), rgba(255, 102, 102, 0.05))',
    },
  ];

  return (
    <section id="tracks" className="tracks-section">
      {/* Racing Stripe Top Border */}
      <div className="racing-stripe-border"></div>

      {/* Decorative Background */}
      <div className="tracks-decoration">
        <div className="checkered-pattern"></div>
        <div className="speed-lines"></div>
        <div className="grid-overlay"></div>
        <div className="racing-number-bg">02</div>
      </div>

      {/* Main Container */}
      <div className="tracks-container">
        {/* Section Header */}
        <motion.div
          className="tracks-header"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="section-label">COMPETE & INNOVATE</div>
          <h2 className="section-title">
            <span className="title-word">COMPETITION</span>
            <span className="title-word accent">TRACKS</span>
          </h2>
          <p className="section-subtitle">
            Choose your track and race towards innovation across 5 exciting domains
          </p>
          <div className="title-underline"></div>
        </motion.div>

        {/* Tracks Grid */}
        <motion.div
          className="tracks-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {tracksData.map((track, index) => {
            const IconComponent = track.icon;
            return (
              <motion.div
                key={index}
                className="track-card"
                variants={cardVariants}
                whileHover={{
                  y: -10,
                  transition: { duration: 0.3 },
                }}
                style={{ '--track-color': track.color }}
              >
                <div className="track-number">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                </div>

                <div className="track-icon-wrapper">
                  <IconComponent className="track-icon" size={40} />
                  <div className="icon-glow"></div>
                </div>

                <h3 className="track-title">{track.title}</h3>
                <p className="track-description">{track.description}</p>

                <div className="track-footer">
                  <div className="track-accent-line"></div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Special Recognition Banner */}
        <motion.div
          className="special-recognition"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="recognition-icon">
            <Award size={32} />
          </div>
          <div className="recognition-content">
            <h3 className="recognition-title">Special Recognition</h3>
            <p className="recognition-description">
              One dedicated track will recognize the <span className="highlight">Best All-Girls Team</span> among participants
            </p>
          </div>
          <div className="recognition-decoration">
            <div className="pulse-ring"></div>
            <div className="pulse-ring"></div>
          </div>
        </motion.div>

        {/* Stats Banner */}
        <motion.div
          className="tracks-stats"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="tracks-stat-item">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-value">4</div>
              <div className="stat-label">Main Tracks</div>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="tracks-stat-item">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-value">75+</div>
              <div className="stat-label">Teams</div>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="tracks-stat-item">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-value">₹80K+</div>
              <div className="stat-label">Prize Pool</div>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="tracks-stat-item">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <div className="stat-value">24</div>
              <div className="stat-label">Hours</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TracksSection;
