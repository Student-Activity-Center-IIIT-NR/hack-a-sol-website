'use client';
import React, { useEffect, useRef, useState } from 'react';
import '../styles/HeroSection.css';

export default function HeroSection() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState('PLAYING'); // 'PLAYING' or 'GAMEOVER'

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    // Load saved highscore
    const savedHi = parseInt(localStorage.getItem('hackasol_dino_hi') || '0', 10);
    setHighScore(savedHi);

    // Dynamic sizing
    const resize = () => {
      canvas.width = Math.min(canvas.parentElement.clientWidth, 1200);
      canvas.height = 300;
    };
    resize();
    window.addEventListener('resize', resize);

    // Audio SFX with Web Audio API (lightweight, zero dependency)
    let audioCtx = null;
    const playBeep = (freq, type = 'square', duration = 0.08) => {
      try {
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch (e) {
        // Audio not allowed yet
      }
    };

    // Ground & physics constants
    const GROUND_Y = 240;
    const GRAVITY = 0.65;
    const JUMP_FORCE = -12.5;

    // Game Variables
    let currentScore = 0;
    let hiScore = savedHi;
    let isGameOver = false;
    let gameSpeed = 6;
    let groundOffset = 0;

    // Dino Object
    const dino = {
      x: 60,
      y: GROUND_Y - 48,
      w: 44,
      h: 48,
      vy: 0,
      isGrounded: true,
      legFrame: 0,
      legTimer: 0,
      jump() {
        if (this.isGrounded && !isGameOver) {
          this.vy = JUMP_FORCE;
          this.isGrounded = false;
          playBeep(440, 'square', 0.1);
        }
      },
      update() {
        this.vy += GRAVITY;
        this.y += this.vy;

        if (this.y >= GROUND_Y - this.h) {
          this.y = GROUND_Y - this.h;
          this.vy = 0;
          this.isGrounded = true;
        }

        // Animate legs when grounded
        if (this.isGrounded && !isGameOver) {
          this.legTimer++;
          if (this.legTimer > 6) {
            this.legFrame = (this.legFrame + 1) % 2;
            this.legTimer = 0;
          }
        }
      },
      draw(ctx) {
        ctx.save();
        ctx.fillStyle = '#ffffff';

        // Classic Pixel Dino Geometry
        const x = this.x;
        const y = this.y;

        // Head
        ctx.fillRect(x + 22, y, 22, 16);
        ctx.fillRect(x + 18, y + 6, 26, 12);

        // Eye
        if (isGameOver) {
          // X Eye on Game Over
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 10px monospace';
          ctx.fillText('X', x + 26, y + 10);
        } else {
          ctx.fillStyle = '#000000';
          ctx.fillRect(x + 26, y + 4, 4, 4);
        }

        // Body & Belly
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 10, y + 18, 24, 18);
        ctx.fillRect(x + 14, y + 16, 18, 6);

        // Tail
        ctx.fillRect(x, y + 18, 10, 8);
        ctx.fillRect(x + 4, y + 26, 8, 4);

        // Short Arm
        ctx.fillRect(x + 32, y + 24, 8, 4);

        // Legs
        if (isGameOver || !this.isGrounded) {
          // Both legs down
          ctx.fillRect(x + 14, y + 36, 4, 12);
          ctx.fillRect(x + 24, y + 36, 4, 12);
        } else {
          // Running animation alternating legs
          if (this.legFrame === 0) {
            ctx.fillRect(x + 14, y + 36, 4, 12);
            ctx.fillRect(x + 18, y + 44, 4, 4);
            ctx.fillRect(x + 24, y + 36, 4, 6);
          } else {
            ctx.fillRect(x + 14, y + 36, 4, 6);
            ctx.fillRect(x + 24, y + 36, 4, 12);
            ctx.fillRect(x + 28, y + 44, 4, 4);
          }
        }

        ctx.restore();
      },
    };

    // Obstacles (Cacti & Birds)
    let obstacles = [];
    let obstacleTimer = 0;

    class Obstacle {
      constructor(type, x) {
        this.type = type;
        this.x = x;
        if (type === 'cactus-small') {
          this.w = 18;
          this.h = 36;
          this.y = GROUND_Y - this.h;
        } else if (type === 'cactus-double') {
          this.w = 34;
          this.h = 38;
          this.y = GROUND_Y - this.h;
        } else if (type === 'cactus-triple') {
          this.w = 48;
          this.h = 44;
          this.y = GROUND_Y - this.h;
        } else {
          // Bird
          this.w = 38;
          this.h = 24;
          this.y = GROUND_Y - 55 - (Math.random() > 0.5 ? 25 : 0);
          this.wingFrame = 0;
          this.wingTimer = 0;
        }
      }

      update(speed) {
        this.x -= speed;
        if (this.type === 'bird') {
          this.wingTimer++;
          if (this.wingTimer > 8) {
            this.wingFrame = (this.wingFrame + 1) % 2;
            this.wingTimer = 0;
          }
        }
      }

      draw(ctx) {
        ctx.save();
        if (this.type.startsWith('cactus')) {
          ctx.fillStyle = '#00F0FF'; // Neon Teal comic cactus
          if (this.type === 'cactus-small') {
            ctx.fillRect(this.x + 6, this.y, 6, this.h);
            ctx.fillRect(this.x, this.y + 10, 6, 12);
            ctx.fillRect(this.x, this.y + 18, 18, 4);
          } else if (this.type === 'cactus-double') {
            ctx.fillRect(this.x + 4, this.y + 4, 6, this.h - 4);
            ctx.fillRect(this.x + 18, this.y, 6, this.h);
            ctx.fillRect(this.x, this.y + 14, 28, 4);
          } else {
            ctx.fillRect(this.x + 4, this.y + 6, 6, this.h - 6);
            ctx.fillRect(this.x + 18, this.y, 8, this.h);
            ctx.fillRect(this.x + 34, this.y + 4, 6, this.h - 4);
            ctx.fillRect(this.x, this.y + 16, 44, 4);
          }
        } else {
          // Bird / Pterodactyl
          ctx.fillStyle = '#FF5E00'; // Orange Comic Pterodactyl
          ctx.fillRect(this.x, this.y + 8, this.w, 8);
          ctx.fillRect(this.x + 28, this.y + 4, 10, 6);
          // Wings
          if (this.wingFrame === 0) {
            ctx.fillRect(this.x + 14, this.y - 8, 8, 12);
          } else {
            ctx.fillRect(this.x + 14, this.y + 12, 8, 10);
          }
        }
        ctx.restore();
      }
    }

    // Reset / Restart
    const restartGame = () => {
      isGameOver = false;
      currentScore = 0;
      gameSpeed = 6;
      dino.y = GROUND_Y - dino.h;
      dino.vy = 0;
      dino.isGrounded = true;
      obstacles = [];
      obstacleTimer = 0;
      setGameState('PLAYING');
      setScore(0);
      playBeep(600, 'sine', 0.1);
    };

    // Input Handlers
    const handleAction = () => {
      if (isGameOver) {
        restartGame();
      } else {
        dino.jump();
      }
    };

    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleAction();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('mousedown', handleAction);
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleAction();
    }, { passive: false });

    // Main Game Loop
    const loop = () => {
      animId = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Ground
      groundOffset = (groundOffset + gameSpeed) % 24;
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(canvas.width, GROUND_Y);
      ctx.stroke();

      // Dotted ground noise
      ctx.fillStyle = '#64748b';
      for (let gx = -groundOffset; gx < canvas.width; gx += 28) {
        ctx.fillRect(gx, GROUND_Y + 6, 6, 2);
        ctx.fillRect(gx + 12, GROUND_Y + 14, 4, 2);
      }
      ctx.restore();

      // Cloud background decorations
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(120, 50, 48, 14);
      ctx.fillRect(135, 42, 28, 14);
      ctx.fillRect(450, 80, 56, 16);
      ctx.fillRect(470, 70, 30, 16);
      ctx.fillRect(800, 40, 50, 14);

      if (!isGameOver) {
        // Increase score
        currentScore += 0.2;
        setScore(Math.floor(currentScore));

        // Speed increases gradually
        if (gameSpeed < 14) gameSpeed += 0.0015;

        // Spawn Obstacles
        obstacleTimer++;
        const spawnInterval = Math.max(65, Math.floor(130 - gameSpeed * 4));
        if (obstacleTimer > spawnInterval) {
          obstacleTimer = 0;
          const rand = Math.random();
          let type = 'cactus-small';
          if (rand > 0.75 && currentScore > 120) {
            type = 'bird';
          } else if (rand > 0.5) {
            type = 'cactus-triple';
          } else if (rand > 0.25) {
            type = 'cactus-double';
          }
          obstacles.push(new Obstacle(type, canvas.width + 20));
        }

        // Update Dino
        dino.update();

        // Update & Check Collisions for Obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
          const obs = obstacles[i];
          obs.update(gameSpeed);

          // AABB Collision Detection
          const padding = 6;
          if (
            dino.x + padding < obs.x + obs.w - padding &&
            dino.x + dino.w - padding > obs.x + padding &&
            dino.y + padding < obs.y + obs.h - padding &&
            dino.y + dino.h - padding > obs.y + padding
          ) {
            // Collision!
            isGameOver = true;
            setGameState('GAMEOVER');
            playBeep(180, 'sawtooth', 0.25);

            if (currentScore > hiScore) {
              hiScore = Math.floor(currentScore);
              setHighScore(hiScore);
              localStorage.setItem('hackasol_dino_hi', hiScore.toString());
            }
          }

          if (obs.x + obs.w < -20) {
            obstacles.splice(i, 1);
          }
        }
      }

      // Draw Dino & Obstacles
      dino.draw(ctx);
      obstacles.forEach((obs) => obs.draw(ctx));

      // Draw Classic Retro Score (Top Right)
      ctx.save();
      ctx.font = 'bold 20px monospace';
      ctx.fillStyle = '#94a3b8';
      const padZero = (n) => String(n).padStart(5, '0');
      ctx.fillText(`HI ${padZero(hiScore)}  ${padZero(Math.floor(currentScore))}`, canvas.width - 240, 40);
      ctx.restore();

      // Game Over Overlay
      if (isGameOver) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = 'bold 42px "Bangers", cursive, sans-serif';
        ctx.fillStyle = '#FFE600';
        ctx.textAlign = 'center';
        ctx.fillText('G A M E   O V E R', canvas.width / 2, 120);

        ctx.font = 'bold 18px "Inter", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('PRESS SPACE OR TAP TO RESTART', canvas.width / 2, 160);

        // Retro Restart Icon Box
        ctx.fillStyle = '#FF5E00';
        ctx.fillRect(canvas.width / 2 - 20, 185, 40, 40);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(canvas.width / 2 - 20, 185, 40, 40);

        ctx.fillStyle = '#000000';
        ctx.font = '24px sans-serif';
        ctx.fillText('↻', canvas.width / 2, 213);
        ctx.restore();
      }
    };

    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('mousedown', handleAction);
    };
  }, []);

  return (
    <div className="modular-hero-root">
      <div className="modular-hero-container">
        {/* Crisp Header Title & Caption */}
        <div className="dino-hero-header text-center">
          <div className="inline-block bg-[#FF5E00] text-black px-4 py-1 font-['Bangers'] tracking-widest text-sm uppercase rounded-full border-2 border-black shadow-[3px_3px_0px_#000] mb-2">
            🕷️ CENTRAL INDIA'S 36-HOUR MULTIVERSE HACKATHON
          </div>

          <h1 className="dino-main-title">
            HACK-A-SOL 5.0
          </h1>

          <p className="dino-small-caption">
            36 Hours Non-Stop • IIIT Naya Raipur • Code, Assemble & Survive
          </p>
        </div>

        {/* The Classic Dino Game Arena */}
        <div className="dino-arcade-frame">
          <div className="dino-frame-header">
            <div className="dino-status-dots">
              <span className="frame-dot red-dot"></span>
              <span className="frame-dot yellow-dot"></span>
              <span className="frame-dot green-dot"></span>
              <span className="frame-title">CLASSIC DINO RUNNER // 8-BIT ARCADE</span>
            </div>
            <div className="dino-controls-hint">
              <span>[SPACE] / [↑] / TAP TO JUMP</span>
            </div>
          </div>

          <div className="dino-canvas-holder">
            <canvas ref={canvasRef} className="dino-canvas" />
          </div>

          <div className="dino-frame-footer">
            <span>PRESS SPACEBAR OR TAP SCREEN TO JUMP OVER CACTI & BIRDS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
