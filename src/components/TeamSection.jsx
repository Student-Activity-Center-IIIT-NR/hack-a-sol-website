import { motion } from 'framer-motion';
import { useState } from 'react';
import '../styles/TeamSection.css';

const TeamSection = () => {
  const [selectedMember, setSelectedMember] = useState(0);

  const teamMembers = [
    {
      id: 1,
      name: "ALEX RIVERA",
      role: "Lead Developer",
      position: "P1",
      number: "01",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&face",
      country: "USA",
      bio: "Full-stack developer with expertise in React, Node.js, and cloud architecture. Passionate about building scalable solutions.",
      stats: {
        projects: "25+",
        experience: "5 YRS",
        speciality: "FULL-STACK"
      }
    },
    {
      id: 2,
      name: "MARIA GONZALEZ",
      role: "UI/UX Designer",
      position: "P2",
      number: "02",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=500&fit=crop&face",
      country: "ESP",
      bio: "Creative designer focused on user-centered design and modern interfaces. Expert in Figma and design systems.",
      stats: {
        projects: "30+",
        experience: "4 YRS",
        speciality: "UI/UX"
      }
    },
    {
      id: 3,
      name: "JAMES WILSON",
      role: "Backend Engineer",
      position: "P3",
      number: "03",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&face",
      country: "GBR",
      bio: "Backend specialist with deep knowledge of microservices, databases, and API design. Performance optimization expert.",
      stats: {
        projects: "40+",
        experience: "6 YRS",
        speciality: "BACKEND"
      }
    },
    {
      id: 4,
      name: "SOFIA CHEN",
      role: "DevOps Engineer",
      position: "P4",
      number: "04",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&face",
      country: "CHN",
      bio: "DevOps engineer specializing in CI/CD pipelines, containerization, and cloud infrastructure automation.",
      stats: {
        projects: "35+",
        experience: "4 YRS",
        speciality: "DEVOPS"
      }
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section id="team" className="team-section">
      {/* Header */}
      <div className="team-header">
        <div className="team-header-content">
          <div className="section-label">
            <span className="label-text">MEET THE TEAM</span>
            <div className="label-line"></div>
          </div>
          
          <motion.h2 
            className="team-title"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="title-main">HACK-A-SOL</span>
            <span className="title-sub">RACING TEAM</span>
          </motion.h2>
          
          <motion.p 
            className="team-description"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Our championship team of developers, designers, and engineers 
            working together to create the fastest digital solutions in the industry.
          </motion.p>
        </div>

        {/* Racing number background */}
        <div className="header-racing-number">2024</div>
      </div>

      {/* Team Grid */}
      <div className="team-content">
        <motion.div 
          className="team-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.id}
              className={`team-card ${index === selectedMember ? 'active' : ''}`}
              variants={cardVariants}
              whileHover={{ 
                y: -10,
                transition: { duration: 0.3 }
              }}
              onClick={() => setSelectedMember(index)}
            >
              {/* Card Header */}
              <div className="card-header">
                <div className="member-position">
                  <span className="position-label">POS</span>
                  <span className="position-number">{member.position}</span>
                </div>
                <div className="member-number">{member.number}</div>
              </div>

              {/* Member Image */}
              <div className="member-image-container">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="member-image"
                />
                <div className="image-overlay"></div>
                <div className="country-flag">{member.country}</div>
              </div>

              {/* Member Info */}
              <div className="member-info">
                <h3 className="member-name">{member.name}</h3>
                <p className="member-role">{member.role}</p>
                
                <div className="member-stats">
                  <div className="stat-item">
                    <span className="stat-label">PROJECTS</span>
                    <span className="stat-value">{member.stats.projects}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">EXP</span>
                    <span className="stat-value">{member.stats.experience}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">SPEC</span>
                    <span className="stat-value">{member.stats.speciality}</span>
                  </div>
                </div>
              </div>

              {/* Hover Details */}
              <motion.div 
                className="member-details"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p className="member-bio">{member.bio}</p>
                <div className="detail-line"></div>
              </motion.div>

              {/* Racing stripe */}
              <div className="racing-stripe"></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Selected Member Highlight */}
        <motion.div 
          className="selected-member-highlight"
          key={selectedMember}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="highlight-content">
            <div className="highlight-info">
              <h4 className="highlight-name">{teamMembers[selectedMember].name}</h4>
              <p className="highlight-role">{teamMembers[selectedMember].role}</p>
              <p className="highlight-bio">{teamMembers[selectedMember].bio}</p>
            </div>
            <div className="highlight-number">{teamMembers[selectedMember].number}</div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Stats */}
      <div className="team-stats">
        <div className="stats-container">
          <div className="stat-block">
            <span className="stat-number">4</span>
            <span className="stat-label">TEAM MEMBERS</span>
          </div>
          <div className="stat-separator"></div>
          <div className="stat-block">
            <span className="stat-number">130+</span>
            <span className="stat-label">TOTAL PROJECTS</span>
          </div>
          <div className="stat-separator"></div>
          <div className="stat-block">
            <span className="stat-number">19</span>
            <span className="stat-label">YEARS COMBINED EXP</span>
          </div>
          <div className="stat-separator"></div>
          <div className="stat-block">
            <span className="stat-number">100%</span>
            <span className="stat-label">SUCCESS RATE</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;