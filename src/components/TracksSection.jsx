'use client';
import React from 'react';
import { Blocks, Shield, Brain, Scale, Lightbulb, Award } from 'lucide-react';
import '../styles/ModularComic.css';

const TracksSection = () => {
  const tracks = [
    {
      id: '01',
      title: 'Web3 & Decentralized',
      comicTag: 'EARTH-616 // BLOCKCHAIN',
      desc: 'Build decentralized applications, smart contracts, and Web3 infrastructure to empower user autonomy.',
      icon: Blocks,
      color: '#ff0098',
      bgClass: 'panel-pink',
    },
    {
      id: '02',
      title: 'Cyber Security',
      comicTag: 'EARTH-199999 // SPIDER-SHIELD',
      desc: 'Develop impenetrable defenses, cryptography protocols, and security monitors to protect the digital universe.',
      icon: Shield,
      color: '#00f0ff',
      bgClass: 'panel-teal',
    },
    {
      id: '03',
      title: 'AI & Machine Learning',
      comicTag: 'EARTH-50101 // NEURAL SYMBIONT',
      desc: 'Innovate with artificial neural nets, computer vision, and generative models to automate complex real-world workflows.',
      icon: Brain,
      color: '#ff5e00',
      bgClass: 'panel-orange',
    },
    {
      id: '04',
      title: 'Policy-Thon',
      comicTag: 'EARTH-65 // PUBLIC WEB',
      desc: 'Create technology-driven solutions and transparent civic tools that influence and improve public policies.',
      icon: Scale,
      color: '#637bff',
      bgClass: 'panel-blue',
    },
    {
      id: '05',
      title: 'Open Innovation',
      comicTag: 'MULTIVERSE // FREE-FORM SPRINT',
      desc: 'Bring your most daring, unconventional, and ground-breaking software or hardware ideas to life.',
      icon: Lightbulb,
      color: '#ffe600',
      bgClass: 'panel-yellow',
    },
  ];

  return (
    <div id="tracks" className="modular-comic-issue-wrapper border-comic-orange">
      {/* Comic 02 Header Bar */}
      <div className="comic-issue-topbar">
        <div className="issue-heading-group">
          <a href="#tracks" className="comic-issue-pill">comic 02</a>
          <h2 className="comic-issue-title" style={{ color: '#FF7B5F' }}>
            DEPENDENCY <br />
            JENGA
          </h2>
        </div>
      </div>

      {/* Comic Cards Grid */}
      <div className="comic-tracks-grid">
        {tracks.map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.id} className={`comic-track-card ${t.bgClass}`}>
              <div className="track-card-header">
                <span className="track-issue-badge">JENGA BLOCK #{t.id}</span>
                <span className="track-comic-tag">{t.comicTag}</span>
              </div>
              <div className="track-card-body">
                <div className="track-icon-avatar">
                  <Icon size={36} color="#000000" />
                </div>
                <h3 className="track-card-title">{t.title}</h3>
                <p className="track-card-desc">{t.desc}</p>
              </div>
              <div className="track-card-footer">
                <span className="track-status-pill">STATUS: OPEN FOR CHALLENGES</span>
              </div>
            </div>
          );
        })}

        {/* Special Recognition: Spider-Gwen Card */}
        <div className="comic-track-card special-gwen-card">
          <div className="track-card-header">
            <span className="track-issue-badge bg-white text-black">SPECIAL AWARD</span>
            <span className="track-comic-tag">EARTH-65 // SPIDER-GWEN SQUAD</span>
          </div>
          <div className="track-card-body">
            <div className="track-icon-avatar gwen-avatar">
              <Award size={36} color="#000000" />
            </div>
            <h3 className="track-card-title">Spider-Gwen All-Girls Award</h3>
            <p className="track-card-desc">
              Dedicated recognition, exclusive mentorship, and honors for the highest-performing All-Girls Team!
            </p>
          </div>
          <div className="track-card-footer">
            <span className="track-status-pill gwen-pill">EMPOWERING FUTURE LEADERS</span>
          </div>
        </div>
      </div>

      {/* Modular Callout Banner Button */}
      <div className="modular-between-banner">
        <a href="#schedule" className="modular-banner-btn">
          <div className="banner-btn-inner">
            <span className="banner-title">INSPECT MISSION COUNTDOWN & PRIZES</span>
            <span className="banner-sub">SEE PARTICIPANTS, COLLEGES & PRIZE VAULT BELOW</span>
          </div>
        </a>
      </div>
    </div>
  );
};

export default TracksSection;
