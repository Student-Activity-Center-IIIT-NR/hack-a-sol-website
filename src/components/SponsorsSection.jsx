'use client';
import React from 'react';
import { Zap, ShieldCheck, Award, Sparkles } from 'lucide-react';
import { Carousel_003 } from '@/components/ui/skiper-ui/skiper49';
import '../styles/ModularComic.css';

export default function SponsorsSection() {
  const images = [
    {
      src: '/images/sponsors/665ae12004a0ecb37f244a3c_Frame 512918836.svg',
      alt: 'Sponsor Partner',
    },
    {
      src: '/images/sponsors/edfs.png',
      alt: 'Sponsor Partner',
    },
    {
      src: '/images/sponsors/ejkfs.png',
      alt: 'Sponsor Partner',
    },
    {
      src: '/images/sponsors/github-icon-lg.png',
      alt: 'GitHub',
    },
    {
      src: '/images/sponsors/sfjvsv.png',
      alt: 'Sponsor Partner',
    },
    {
      src: '/images/sponsors/yiwedsdafvjwfe.jpg',
      alt: 'Sponsor Partner',
    },
  ];

  const perks = [
    { icon: Zap, title: 'CLOUD CREDITS', desc: 'Compute & API quotas for 36-hour live deployments' },
    { icon: ShieldCheck, title: 'MENTOR GUIDANCE', desc: 'Industry veterans and tech leads in the war room' },
    { icon: Award, title: 'EXCLUSIVE SWAG', desc: 'Spider-Verse & tech titan collector packs' },
    { icon: Sparkles, title: 'FAST-TRACK ROLES', desc: 'Hiring pipelines & direct interview access' },
  ];

  return (
    <div id="sponsors" className="modular-comic-issue-wrapper border-comic-orange">
      {/* Comic 04 Header Bar */}
      <div className="comic-issue-topbar">
        <div className="issue-heading-group">
          <a href="#sponsors" className="comic-issue-pill">comic 04</a>
          <h2 className="comic-issue-title" style={{ color: 'var(--Comic-Light-Orange, #FF5E00)' }}>
            USERS ARE <br />
            JUST TOO... HUMAN
          </h2>
        </div>
      </div>

      {/* Main Comic Sponsor Panel */}
      <div className="comic-sponsors-container">
        {/* Top Story Frame */}
        <div className="comic-panel panel-blue sponsor-feature-panel">
          <div className="panel-timestamp">GLOBAL SATELLITE FEED • SPONSOR ALLIANCE</div>
          <div className="speech-bubble bubble-left">
            <span className="bubble-speaker">TECH ALLIANCE:</span>
            <p>"Every hero needs high-caliber infrastructure. Our partners bring the weapons, cloud credits, and mentorship to turn 36-hour prototypes into realities!"</p>
          </div>

          {/* Carousel Frame */}
          <div className="sponsor-carousel-frame">
            <div className="frame-screen-header">
              <span className="screen-dot red-dot"></span>
              <span className="screen-dot yellow-dot"></span>
              <span className="screen-dot green-dot"></span>
              <span className="screen-title">OFFICIAL SPONSOR REEL // LIVE CAROUSEL</span>
            </div>
            <div className="carousel-wrapper">
              <Carousel_003
                className="flex justify-center w-full h-full items-center"
                images={images}
                showPagination={true}
                showNavigation={true}
                loop={true}
                autoplay={true}
                spaceBetween={0}
              />
            </div>
          </div>

          <div className="panel-caption">
            PARTNERED WITH INDUSTRY LEADERS COMMITTED TO FOSTERING STUDENT INNOVATION ACROSS INDIA.
          </div>
        </div>

        {/* Perks Grid */}
        <div className="sponsor-perks-grid">
          {perks.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div key={idx} className="perk-comic-card">
                <div className="perk-icon-bubble">
                  <Icon size={20} />
                </div>
                <div className="perk-content">
                  <h4 className="perk-title">{p.title}</h4>
                  <p className="perk-desc">{p.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Between Comics Action Banner */}
      <div className="modular-between-banner">
        <a href="mailto:hackasol@iiitnr.ac.in?subject=Sponsorship%20Inquiry%20Hack-A-Sol%205.0" className="modular-banner-btn banner-teal">
          <div className="banner-btn-inner">
            <span className="banner-title">BECOME A MULTIVERSE SPONSOR</span>
            <span className="banner-sub">PARTNER WITH HACK-A-SOL 5.0 • REACH 2800+ TOP STUDENT DEVELOPERS</span>
          </div>
        </a>
      </div>
    </div>
  );
}
