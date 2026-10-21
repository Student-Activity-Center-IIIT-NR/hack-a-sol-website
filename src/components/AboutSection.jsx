'use client';
import React from 'react';
import '../styles/ModularComic.css';

const AboutSection = () => {
  return (
    <div id="about" className="modular-comic-issue-wrapper border-comic-teal">
      {/* Comic 01 Header Bar */}
      <div className="comic-issue-topbar">
        <div className="issue-heading-group">
          <a href="#about" className="comic-issue-pill">comic 01</a>
          <h2 className="comic-issue-title" style={{ color: 'var(--Comic-Teal, #00F0FF)' }}>
            THE CEILING IS TIRED OF <br />
            GETTING SHATTERED
          </h2>
        </div>
      </div>

      {/* Organizer Cooking Big Announcement Hero Panel */}
      <div className="comic-cooking-banner">
        <div className="cooking-comic-badge">🚨 TOP SECRET DISPATCH</div>
        <h3 className="cooking-main-title">
          TIMELINE COMING SOON: ORGANIZER IS COOKING SOMETHING BIG!
        </h3>
        <p className="cooking-sub">
          The SAC team is in the lab brewing an electrifying 36-hour non-stop schedule with midnight snacks, mystery challenges, and epic multiverse sprints.
        </p>
      </div>

      {/* Comic Multi-Panel Cooking Story */}
      <div className="comic-panel-grid">
        {/* Panel 1: Classified Recipe */}
        <div className="comic-panel panel-pink">
          <div className="panel-timestamp">SECRET LAB • DAY 00</div>
          <div className="panel-inner">
            <div className="speech-bubble bubble-left">
              <span className="bubble-speaker">HEAD CHEF // ORGANIZER:</span>
              <p>"Simmer down! We are loading 36 hours of radioactive problem statements, workshops, and surprise midnight power-ups!"</p>
            </div>
            <div className="panel-illustration spider-alert">
              <span className="panel-emoji">👨‍🍳🥘⚡</span>
              <div className="sound-effect-tag">SIZZLE!</div>
            </div>
            <div className="panel-caption">
              ORGANIZERS ARE PREPARING THE BIGGEST HACKATHON OF 2025.
            </div>
          </div>
        </div>

        {/* Panel 2: The Ingredients */}
        <div className="comic-panel panel-teal">
          <div className="panel-timestamp">WAR ROOM • KITCHEN</div>
          <div className="panel-inner">
            <div className="speech-bubble bubble-right">
              <span className="bubble-speaker">CORE COMMITTEE:</span>
              <p>"Upgrading to 36 non-stop hours with high-energy fuel and industry titan mentors!"</p>
            </div>
            <div className="panel-illustration code-chaos">
              <div className="sound-burst-comic">BOILING!</div>
              <div className="code-snippet-box">
                <code>duration = "36_HOURS_NON_STOP"</code>
                <code>status = "ORGANIZER_COOKING_BIG"</code>
              </div>
            </div>
            <div className="panel-caption">
              THE CEILING CANNOT HOLD WHAT IS COMING NEXT.
            </div>
          </div>
        </div>

        {/* Panel 3: Half-Time Prep */}
        <div className="comic-panel panel-orange">
          <div className="panel-timestamp">RECIPE SPECS • 36 HOURS</div>
          <div className="panel-inner">
            <div className="speech-bubble bubble-left">
              <span className="bubble-speaker">LEAD MENTOR:</span>
              <p>"When the stove is hot, only the best developers shine. 300+ hackers on campus will feast on pure innovation!"</p>
            </div>
            <div className="panel-stats-row">
              <div className="comic-stat-box">
                <span className="stat-big">36</span>
                <span className="stat-desc">HOURS NON-STOP</span>
              </div>
              <div className="comic-stat-box">
                <span className="stat-big">300+</span>
                <span className="stat-desc">HACKERS LIVE</span>
              </div>
              <div className="comic-stat-box">
                <span className="stat-big">75+</span>
                <span className="stat-desc">FINAL SQUADS</span>
              </div>
            </div>
            <div className="panel-caption">
              TIMELINE REVEAL IMMINENT. KEEP YOUR NOTIFICATIONS ON.
            </div>
          </div>
        </div>

        {/* Panel 4: Hold Your Horses */}
        <div className="comic-panel panel-magenta">
          <div className="panel-timestamp">FINAL PLATING • ATAL NAGAR</div>
          <div className="panel-inner">
            <div className="speech-bubble bubble-center">
              <span className="bubble-speaker">SPIDER-MAN:</span>
              <p>"LET 'EM COOK! THE GRAND 36-HOUR TIMELINE WILL DROP SOON ACROSS ALL CHANNELS!"</p>
            </div>
            <div className="panel-illustration finish-flag">
              <div className="sound-burst-comic yellow-burst">POP!</div>
              <span className="finish-check">✓ SOMETHING HUGE IN THE OVEN</span>
            </div>
            <div className="panel-caption">
              HACK-A-SOL 5.0: STAGED AT IIIT NAYA RAIPUR CAMPUS.
            </div>
          </div>
        </div>
      </div>

      {/* Modular Callout Banner Button */}
      <div className="modular-between-banner">
        <a href="#tracks" className="modular-banner-btn">
          <div className="banner-btn-inner">
            <span className="banner-title">ASSEMBLE YOUR MULTIVERSE SQUAD</span>
            <span className="banner-sub">CHOOSE YOUR MISSION TRACK BELOW • 5 DIMENSIONS OPEN</span>
          </div>
        </a>
      </div>
    </div>
  );
};

export default AboutSection;