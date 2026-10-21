'use client';
import React from 'react';
import { 
  Mail, Phone, MapPin, Calendar, 
  ChevronRight, ArrowUpRight, Github, Twitter, Linkedin, 
  MessageSquare, Heart
} from 'lucide-react';
import '../styles/ModularComic.css';

export default function Footer() {
  const navLinks = [
    { label: '[COMIC 01] TIMELINE COOKING', href: '#about' },
    { label: '[COMIC 02] 5 TRACKS (DEPENDENCY JENGA)', href: '#tracks' },
    { label: '[COMIC 03] COUNTDOWN & RADAR', href: '#schedule' },
    { label: '[COMIC 04] ALLIED SPONSORS', href: '#sponsors' },
    { label: '[TOP] ASSEMBLE TO STAGE', href: '#hero' },
  ];

  const modularFooterNav = [
    { label: 'Tracks', href: '#tracks' },
    { label: 'Vault', href: '#schedule' },
    { label: 'Sponsors', href: '#sponsors' },
    { label: 'Community', href: 'https://discord.com' },
    { label: 'Contact', href: 'mailto:hackasol@iiitnr.ac.in' },
  ];

  return (
    <footer id="footer" className="modular-comic-issue-wrapper border-comic-pink">
      {/* Comic 05 Header Bar */}
      <div className="comic-issue-topbar">
        <div className="issue-heading-group">
          <a href="#footer" className="comic-issue-pill">comic 05</a>
          <h2 className="comic-issue-title" style={{ color: 'var(--Comic-Light-Pink, #FFA3C0)' }}>
            TO BE CONTINUED IN <br />
            HACK-A-SOL 5.0...
          </h2>
        </div>
      </div>

      {/* 4-Panel Comic Finale Grid */}
      <div className="comic-footer-grid">
        {/* Panel 1: Headquarters */}
        <div className="comic-panel panel-orange footer-comic-panel">
          <div className="panel-timestamp">PANEL A // HQ COORDINATES</div>
          <div className="footer-panel-body">
            <div className="speech-bubble bubble-left">
              <span className="bubble-speaker">SPIDER-MAN:</span>
              <p>"With great code comes great responsibility. See you at IIIT-NR!"</p>
            </div>
            <div className="footer-info-block">
              <div className="info-row">
                <MapPin className="comic-inline-icon" size={18} />
                <div>
                  <strong>IIIT Naya Raipur</strong>
                  <p>Plot No. 7, Sector 24, Atal Nagar, Chhattisgarh 493661</p>
                </div>
              </div>
              <div className="info-row">
                <Calendar className="comic-inline-icon" size={18} />
                <div>
                  <strong>36-Hour Non-Stop Sprint</strong>
                  <p>National Flagship Multiverse Hackathon</p>
                </div>
              </div>
            </div>
          </div>
          <div className="panel-caption">
            OFFICIAL STAGING GROUNDS OF HACK-A-SOL 5.0
          </div>
        </div>

        {/* Panel 2: Emergency Hotlines */}
        <div className="comic-panel panel-pink footer-comic-panel">
          <div className="panel-timestamp">PANEL B // HERO EMERGENCY HOTLINE</div>
          <div className="footer-panel-body">
            <div className="speech-bubble bubble-left">
              <span className="bubble-speaker">LEAD ORGANIZERS:</span>
              <p>"Have queries or need assistance? Reach out to the lead organizers directly!"</p>
            </div>

            <div className="contacts-comic-list">
              <a href="tel:8260984497" className="contact-comic-badge">
                <Phone size={16} />
                <div className="contact-texts">
                  <span className="contact-role">LEAD ORGANIZER</span>
                  <span className="contact-name">Sumit: +91 8260984497</span>
                </div>
                <ArrowUpRight size={14} className="badge-arrow" />
              </a>

              <a href="tel:9039027103" className="contact-comic-badge">
                <Phone size={16} />
                <div className="contact-texts">
                  <span className="contact-role">LEAD ORGANIZER</span>
                  <span className="contact-name">Bhavika: +91 9039027103</span>
                </div>
                <ArrowUpRight size={14} className="badge-arrow" />
              </a>

              <a href="mailto:hackasol@iiitnr.ac.in" className="contact-comic-badge email-badge">
                <Mail size={16} />
                <div className="contact-texts">
                  <span className="contact-role">OFFICIAL DISPATCH</span>
                  <span className="contact-name">hackasol@iiitnr.ac.in</span>
                </div>
                <ArrowUpRight size={14} className="badge-arrow" />
              </a>
            </div>
          </div>
          <div className="panel-caption">
            24/7 SUPPORT DISPATCH FOR PARTICIPANTS & MENTORS
          </div>
        </div>

        {/* Panel 3: Multiverse Quick Portals */}
        <div className="comic-panel panel-teal footer-comic-panel">
          <div className="panel-timestamp">PANEL C // MULTIVERSE PORTALS</div>
          <div className="footer-panel-body">
            <div className="speech-bubble bubble-left">
              <span className="bubble-speaker">PORTAL OPERATOR:</span>
              <p>"Jump straight into any chapter of the Hack-A-Sol chronicle!"</p>
            </div>

            <ul className="footer-comic-links">
              {navLinks.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="comic-portal-link">
                    <ChevronRight size={16} />
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="panel-caption">
            QUICK ACCESS TO ALL HACK-A-SOL 5.0 DIMENSIONS
          </div>
        </div>

        {/* Panel 4: Daily Bugle Bulletin & Socials */}
        <div className="comic-panel panel-yellow footer-comic-panel">
          <div className="panel-timestamp">PANEL D // DAILY BUGLE BULLETIN</div>
          <div className="footer-panel-body">
            <div className="speech-bubble bubble-left">
              <span className="bubble-speaker">DAILY BUGLE:</span>
              <p>"Stay wired into the latest hackathon broadcasts and announcements!"</p>
            </div>

            <div className="footer-socials-grid">
              <a href="https://github.com/Student-Activity-Center-IIIT-NR/hack-a-sol-website" target="_blank" rel="noreferrer" className="social-pill-btn" aria-label="GitHub">
                <Github size={18} />
                <span>GITHUB</span>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-pill-btn" aria-label="Twitter">
                <Twitter size={18} />
                <span>X / TWITTER</span>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-pill-btn" aria-label="LinkedIn">
                <Linkedin size={18} />
                <span>LINKEDIN</span>
              </a>
              <a href="https://discord.com" target="_blank" rel="noreferrer" className="social-pill-btn" aria-label="Discord">
                <MessageSquare size={18} />
                <span>DISCORD</span>
              </a>
            </div>
          </div>
          <div className="panel-caption">
            OFFICIAL CHANNELS OF STUDENT ACTIVITY CENTER (SAC) IIIT-NR
          </div>
        </div>
      </div>

      {/* Modular Links Navigation Footer */}
      <div className="modular-footer-nav-bar">
        {modularFooterNav.map((item, idx) => (
          <a key={idx} href={item.href} className="modular-nav-item">
            {item.label}
          </a>
        ))}
      </div>

      {/* Comic Finale Bottom Strip */}
      <div className="footer-bottom-strip">
        <div className="bottom-strip-container">
          <div className="copyright-comic">
            <span className="comic-shield-dot"></span>
            <span>© 2025 HACK-A-SOL 5.0 // STUDENT ACTIVITY CENTER IIIT-NR. ALL RIGHTS RESERVED.</span>
          </div>

          <div className="made-with-badge">
            <Heart size={16} className="heart-pulse" fill="#e62429" stroke="#000" strokeWidth={2} />
            <span className="made-text">Made with ❤️ by sandeep and mishi</span>
          </div>
        </div>
      </div>
    </footer>
  );
}