'use client';
import React from 'react';
import '../styles/ModularComic.css';

const ScheduleSection = () => {
  const stats = [
    { label: 'COLLEGES IN THE WEB', value: '250+', tag: 'PAN-INDIA' },
    { label: 'MULTIVERSE PARTICIPANTS', value: '2800+', tag: 'APPLICATIONS' },
    { label: 'HERO SQUADS ASSEMBLED', value: '75+', tag: 'FINALISTS' },
    { label: 'SPIDER TRACKS', value: '5', tag: 'DOMAINS' },
    { label: 'WEB-WARRIORS HACKING', value: '300+', tag: 'ON CAMPUS' },
  ];

  return (
    <div id="schedule" className="modular-comic-issue-wrapper border-comic-green">
      {/* Comic 03 Header Bar */}
      <div className="comic-issue-topbar">
        <div className="issue-heading-group">
          <a href="#schedule" className="comic-issue-pill">comic 03</a>
          <h2 className="comic-issue-title" style={{ color: 'var(--Comic-Light-Blue, #637BFF)' }}>
            IT WORKED YESTERDAY <br />
            aka DEMO GODS
          </h2>
        </div>
      </div>

      {/* Main Comic Centerpiece Layout */}
      <div className="comic-schedule-layout">
        {/* Left Stats Column */}
        <div className="stats-column left-stats">
          {stats.slice(0, 3).map((s, idx) => (
            <div key={idx} className="modular-stat-panel">
              <span className="stat-tag">{s.tag}</span>
              <span className="stat-number">{s.value}</span>
              <span className="stat-name">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Center Spider-Signal / Sunburst Prize Pool Badge */}
        <div className="comic-sunburst-center">
          <div className="sunburst-outer">
            <div className="sunburst-rays"></div>
            <div className="sunburst-core">
              <span className="sunburst-badge-tag">SECRET VAULT</span>
              <span className="sunburst-main-text">COMING SOON</span>
              <span className="sunburst-sub-text">PRIZE POOL</span>
              <div className="sunburst-spider">🕷️⚡</div>
            </div>
          </div>
          <div className="sunburst-caption">
            "PREPARE YOUR CODE — EPIC 36-HOUR REWARDS TO BE UNVEILED!"
          </div>
        </div>

        {/* Right Stats Column */}
        <div className="stats-column right-stats">
          {stats.slice(3).map((s, idx) => (
            <div key={idx} className="modular-stat-panel">
              <span className="stat-tag">{s.tag}</span>
              <span className="stat-number">{s.value}</span>
              <span className="stat-name">{s.label}</span>
            </div>
          ))}
          <div className="modular-stat-panel special-callout">
            <span className="stat-tag">LOCATION</span>
            <span className="stat-number-text">IIIT NAYA RAIPUR</span>
            <span className="stat-name">36-HOUR NATIONAL ARENA</span>
          </div>
        </div>
      </div>

      {/* Modular Callout Banner Button */}
      <div className="modular-between-banner">
        <a href="#sponsors" className="modular-banner-btn">
          <div className="banner-btn-inner">
            <span className="banner-title">MEET OUR ALLIED SPONSORS</span>
            <span className="banner-sub">TECH TITANS POWERING THE 36-HOUR HACKATHON</span>
          </div>
        </a>
      </div>
    </div>
  );
};

export default ScheduleSection;