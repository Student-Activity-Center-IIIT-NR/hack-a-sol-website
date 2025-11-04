import { motion } from 'framer-motion';
import { Trophy, Users, Code, Zap, Target, Rocket } from 'lucide-react';
import '../styles/AboutSection.css';

const AboutSection = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const statsData = [
    { icon: Trophy, value: '24', label: 'HOURS', subtitle: 'Non-Stop Coding' },
    { icon: Users, value: '300+', label: 'HACKERS', subtitle: 'Tech Enthusiasts' },
    { icon: Code, value: '75+', label: 'TEAMS', subtitle: 'Diverse Talent' },
  ];

  const featuresData = [
    { icon: Zap, title: 'Pan-India Event', description: 'Students and developers from across India collaborate on real-world challenges' },
    { icon: Target, title: 'Social Impact', description: 'Build solutions that create real change and influence public policies' },
    { icon: Rocket, title: '₹80,000+ Prizes', description: 'Compete across 4 tracks with dedicated Best All-Girls Team recognition' },
  ];

  return (
    <section id="about" className="about-section">
      {/* Racing Stripe Top Border */}
      <div className="racing-stripe-border"></div>

      {/* Decorative Background Elements */}
      <div className="about-decoration">
        <div className="checkered-pattern"></div>
        <div className="speed-lines"></div>
        <div className="grid-overlay"></div>
        <div className="racing-number-bg">01</div>
      </div>

      {/* Main Container */}
      <div className="about-container">
        {/* Section Header */}
        <motion.div
          className="about-header"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="section-label">ABOUT HACK-A-SOL 4.0 IIITNR</div>
          <h2 className="section-title">
            <span className="title-line">
              <span className="title-word">INNOVATE</span>
            </span>
            <span className="title-line">
              <span className="title-word accent">INSPIRE</span>
            </span>
            <span className="title-line">
              <span className="title-word">IMPLEMENT</span>
            </span>
          </h2>
          <div className="title-underline"></div>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div
          className="content-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Hero Description */}
          <motion.div className="hero-description" variants={itemVariants}>
            <p className="main-tagline">
              The <span className="highlight">Prestigious Pan-India Annual Hackathon</span> by IIIT-Naya Raipur
            </p>
            <p className="description-text">
              Hack-A-Sol, organized by IIIT-Naya Raipur (IIIT-NR), stands as a beacon of innovation 
              and collaboration in the realm of technology and problem-solving. Over 1500+ students, 
              developers, and tech enthusiasts have collaborated to solve real-world challenges through technology.
            </p>
            <p className="description-text">
              It's more than a competition — it's a celebration of innovation and the power of technology. 
              Hack-A-Sol 4.0 aims to inspire young tech leaders to build solutions that create real social impact.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div className="stats-grid" variants={itemVariants}>
            {statsData.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={index}
                  className="stat-card"
                  whileHover={{ 
                    y: -8, 
                    boxShadow: '0 20px 40px rgba(255, 0, 0, 0.3)',
                    transition: { duration: 0.3 }
                  }}
                >
                  <div className="stat-icon-wrapper">
                    <IconComponent className="stat-icon" size={32} />
                  </div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                  <div className="stat-subtitle">{stat.subtitle}</div>
                  <div className="stat-accent-line"></div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Features Grid */}
          <motion.div className="features-grid" variants={itemVariants}>
            {featuresData.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="feature-card"
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                >
                  <div className="feature-icon-wrapper">
                    <IconComponent className="feature-icon" size={24} />
                  </div>
                  <div className="feature-content">
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-description">{feature.description}</p>
                  </div>
                  <div className="feature-number">0{index + 1}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Bottom Call-to-Action */}
        <motion.div
          className="about-cta mt-5"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="cta-content">
            <h3 className="cta-title">Ready to Innovate?</h3>
            <p className="cta-subtitle">Join 300+ hackers competing across 4 tracks for ₹80,000+ prizes</p>
          </div>
          <div className="cta-decoration">
            <div className="speed-indicator"></div>
            <div className="speed-indicator"></div>
            <div className="speed-indicator"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;