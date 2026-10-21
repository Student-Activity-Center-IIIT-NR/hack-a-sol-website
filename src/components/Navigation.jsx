import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import '../styles/Navigation.css';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const { scrollY, scrollYProgress } = useScroll();
  
  const navBg = useTransform(scrollY, [0, 80], [0.85, 0.98]);

  const comicSections = [
    { id: 'hero', label: 'ISSUE 5.0', sub: 'COVER' },
    { id: 'about', label: 'COMIC 01', sub: 'TIMELINE' },
    { id: 'tracks', label: 'COMIC 02', sub: 'TRACKS' },
    { id: 'schedule', label: 'COMIC 03', sub: 'COUNTDOWN' },
    { id: 'sponsors', label: 'COMIC 04', sub: 'SPONSORS' },
  ];

  // Track active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (const section of comicSections) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <motion.nav 
        className="modular-comic-nav"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${navBg})`,
        }}
      >
        <div className="modular-nav-container">
          {/* Left: HACK-A-SOL 5.0 branding (Production removed) */}
          <div className="modular-production-tag">
            <a href="#hero" onClick={() => scrollToSection('hero')} className="prod-brand">
              <span className="prod-spider">🕷️</span>
              <span className="prod-name">HACK-A-SOL</span>
              <span className="prod-ver">5.0</span>
            </a>
          </div>

          {/* Center: Comic Issues Pills */}
          <div className="modular-comic-pills">
            {comicSections.map((sec) => (
              <button
                key={sec.id}
                className={`comic-nav-tab ${activeSection === sec.id ? 'active' : ''}`}
                onClick={() => scrollToSection(sec.id)}
              >
                <span className="tab-pill-label">{sec.label}</span>
                <span className="tab-pill-sub">{sec.sub}</span>
              </button>
            ))}
          </div>

          {/* Right: Mobile Menu Toggle only (Share option removed) */}
          <div className="modular-nav-actions">
            <button 
              className="modular-mobile-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Navigation"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Divider bar matching comic.modular.com */}
        <div className="modular-nav-divider"></div>

        {/* Top Progress Bar */}
        <motion.div 
          className="modular-scroll-progress"
          style={{ scaleX: scrollYProgress }}
        />
      </motion.nav>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="modular-mobile-drawer">
          <div className="drawer-header">
            <span className="drawer-title">COMIC DIRECTORY</span>
            <button onClick={() => setIsMenuOpen(false)}><X size={24} /></button>
          </div>
          <div className="drawer-links">
            {comicSections.map((sec, i) => (
              <button
                key={sec.id}
                className="drawer-comic-link"
                onClick={() => scrollToSection(sec.id)}
              >
                <span className="drawer-no">0{i + 1}</span>
                <span className="drawer-text">{sec.label} • {sec.sub}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;