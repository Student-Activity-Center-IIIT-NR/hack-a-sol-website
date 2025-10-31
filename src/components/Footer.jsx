import { motion } from 'framer-motion';
import { Mail, MapPin, Calendar, ExternalLink, Github, Twitter, Instagram, Linkedin } from 'lucide-react';
import '../styles/Footer.css';

const Footer = () => {
  const socialLinks = [
    { icon: <Twitter />, url: '#', label: 'Twitter' },
    { icon: <Instagram />, url: '#', label: 'Instagram' },
    { icon: <Linkedin />, url: '#', label: 'LinkedIn' },
    { icon: <Github />, url: '#', label: 'GitHub' }
  ];

  const quickLinks = [
    { name: 'About', href: '#about' },
    { name: 'Schedule', href: '#schedule' },
    { name: 'Sponsors', href: '#sponsors' }
  ];

  const importantLinks = [
    { name: 'Code of Conduct', href: '#', external: true },
    { name: 'Privacy Policy', href: '#', external: true },
    { name: 'Terms of Service', href: '#', external: true },
    { name: 'MLH Guidelines', href: 'https://mlh.io/code-of-conduct', external: true }
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <motion.div 
            className="footer-brand"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="brand-logo">
              <h2 className="brand-name">HACK-A-SOL</h2>
              <p className="brand-tagline">Formula 1 Innovation Challenge</p>
            </div>
            <p className="brand-description">
              Where speed meets innovation. Join us for 48 hours of high-octane 
              coding and collaboration, inspired by the precision and excellence 
              of Formula 1 racing.
            </p>
            <div className="event-info">
              <div className="info-item">
                <Calendar size={16} />
                <span>December 15-17, 2024</span>
              </div>
              <div className="info-item">
                <MapPin size={16} />
                <span>Virtual & TechHub Boston</span>
              </div>
              <div className="info-item">
                <Mail size={16} />
                <span>hello@hackasol.com</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="footer-links"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="links-section">
              <h4>Quick Links</h4>
              <ul>
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a href={link.href}>{link.name}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="links-section">
              <h4>Important</h4>
              <ul>
                {importantLinks.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href} 
                      target={link.external ? "_blank" : "_self"}
                      rel={link.external ? "noopener noreferrer" : ""}
                    >
                      {link.name}
                      {link.external && <ExternalLink size={12} />}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div 
            className="footer-social"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4>Connect With Us</h4>
            <div className="social-links">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.url}
                  className="social-link"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
            
            <div className="newsletter">
              <h5>Stay Updated</h5>
              <p>Get the latest updates about Hack-a-Sol</p>
              <div className="newsletter-form">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="newsletter-input"
                />
                <motion.button 
                  className="newsletter-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Subscribe
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="footer-mlh"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="mlh-badge">
            <img 
              src="https://static.mlh.io/brand-assets/logo/official/mlh-logomark-color.png" 
              alt="MLH Official Event"
              className="mlh-logo"
            />
            <div className="mlh-text">
              <span className="mlh-label">Official MLH Event</span>
              <span className="mlh-description">
                This event is organized in partnership with Major League Hacking
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="footer-bottom"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bottom-content">
            <div className="copyright">
              <p>&copy; 2024 Hack-a-Sol. All rights reserved.</p>
            </div>
            <div className="built-with">
              <p>Built with ❤️ and lots of ☕ by the Hack-a-Sol team</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* F1 themed decoration */}
      <div className="footer-decoration">
        <div className="checkered-flag"></div>
      </div>
    </footer>
  );
};

export default Footer;