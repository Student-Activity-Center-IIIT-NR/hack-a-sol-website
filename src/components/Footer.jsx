import { Github, Twitter, Linkedin, Mail, Phone, MapPin, Calendar, Send, ChevronRight } from "lucide-react"
import "../styles/Footer.css"

export default function Footer() {
  return (
    <footer className="footer">
      {/* Racing Stripe Top Border */}
      <div className="racing-stripe-top"></div>
      
      {/* Decorative Background Elements */}
      <div className="footer-decoration">
        <div className="checkered-pattern"></div>
        <div className="speed-lines"></div>
        <div className="grid-overlay"></div>
      </div>

      <div className="footer-container">
        {/* Main Footer Grid - 4 Columns */}
        <div className="footer-grid">
          
          {/* Column 1 - Brand & Description */}
          <div className="footer-column footer-brand">
            <div className="brand-header">
              <h3 className="brand-title">HACK-A-SOL</h3>
              <div className="brand-accent-line"></div>
              <p className="brand-tagline">REV UP YOUR CODE</p>
            </div>
            <p className="brand-description">
              The ultimate college hackathon where speed meets innovation. 
              Race against time, compete with the best, and accelerate your coding journey.
            </p>
            <div className="event-details">
              <div className="event-detail-item">
                <Calendar size={16} className="detail-icon" />
                <span>24-Hour Coding Sprint</span>
              </div>
              <div className="event-detail-item">
                <MapPin size={16} className="detail-icon" />
                <span>IIIT Naya Raipur</span>
              </div>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div className="footer-column footer-links">
            <h4 className="column-title">QUICK LINKS</h4>
            <div className="title-underline"></div>
            <ul className="links-list">
              <li>
                <a href="#about" className="footer-link">
                  <ChevronRight size={16} className="link-icon" />
                  <span>About Event</span>
                </a>
              </li>
              <li>
                <a href="#schedule" className="footer-link">
                  <ChevronRight size={16} className="link-icon" />
                  <span>Schedule</span>
                </a>
              </li>
              <li>
                <a href="#themes" className="footer-link">
                  <ChevronRight size={16} className="link-icon" />
                  <span>Themes</span>
                </a>
              </li>
              <li>
                <a href="#sponsors" className="footer-link">
                  <ChevronRight size={16} className="link-icon" />
                  <span>Sponsors</span>
                </a>
              </li>
              <li>
                <a href="#faq" className="footer-link">
                  <ChevronRight size={16} className="link-icon" />
                  <span>FAQ</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3 - Contact Info */}
          <div className="footer-column footer-contact">
            <h4 className="column-title">GET IN TOUCH</h4>
            <div className="title-underline"></div>
            <div className="contact-list">
              <a href="mailto:hackasol@iiitnr.ac.in" className="contact-item">
                <div className="contact-icon-wrapper">
                  <Mail size={18} />
                </div>
                <div className="contact-details">
                  <span className="contact-label">Email Us</span>
                  <span className="contact-value">hackasol@iiitnr.ac.in</span>
                </div>
              </a>
              
              <div className="contact-item">
                <div className="contact-icon-wrapper">
                  <Phone size={18} />
                </div>
                <div className="contact-details">
                  <span className="contact-label">Call Us</span>
                  <div className="phone-numbers">
                    <a href="tel:8109082272" className="phone-link">+91 8109082272</a>
                    <a href="tel:6264883082" className="phone-link">+91 6264883082</a>
                  </div>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon-wrapper">
                  <MapPin size={18} />
                </div>
                <div className="contact-details">
                  <span className="contact-label">Location</span>
                  <span className="contact-value">College Campus<br />Main Auditorium</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 4 - Newsletter & Social */}
          <div className="footer-column footer-newsletter">
            <h4 className="column-title">STAY UPDATED</h4>
            <div className="title-underline"></div>
            <p className="newsletter-description">
              Subscribe to get the latest updates about the hackathon.
            </p>

            <div className="social-section">
              <h5 className="social-title">FOLLOW US</h5>
              <div className="social-links">
                <a href="#" className="social-link" aria-label="GitHub">
                  <Github size={20} />
                </a>
                <a href="#" className="social-link" aria-label="Twitter">
                  <Twitter size={20} />
                </a>
                <a href="#" className="social-link" aria-label="LinkedIn">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <div className="bottom-content">
            <div className="copyright">
              <p>© 2025 Hack-A-Sol. All rights reserved.</p>
            </div>
            <div className="made-with">
              <span>Made with</span>
              <span className="heart-icon">❤️</span>
              <span>by Web-Dev Team & Manas</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}