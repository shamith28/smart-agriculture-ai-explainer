/* ==========================================================================
   AI-POWERED SMART AGRICULTURE - SYNCHRONIZED PLAYER ENGINE
   ========================================================================== */

import { TOTAL_DURATION, SCENES_DATA } from './timeline.js';

export class VideoPlayer {
  constructor(animationEngine, audioManager, uiElements) {
    this.animation = animationEngine;
    this.audio = audioManager;
    this.ui = uiElements;

    this.masterTime = 0.0;
    this.isPlaying = false;
    this.lastTimestamp = null;
    this.animationFrameId = null;

    this.initUI();
    this.renderCurrentFrame();
  }

  initUI() {
    // Play / Pause Toggle
    this.ui.btnPlayPause.addEventListener('click', () => this.togglePlayPause());
    this.ui.stageCanvas.addEventListener('click', () => this.togglePlayPause());

    if (this.ui.stagePrompt) {
      this.ui.stagePrompt.addEventListener('click', () => {
        this.ui.stagePrompt.classList.add('hidden');
        this.play();
      });
    }

    // Restart Button
    this.ui.btnRestart.addEventListener('click', () => this.restart());

    // Timeline Scrubber
    this.ui.timelineWrapper.addEventListener('click', (e) => {
      const rect = this.ui.timelineWrapper.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, clickX / rect.width));
      this.seekTo(pct * TOTAL_DURATION);
    });

    // Volume Slider
    if (this.ui.volumeSlider) {
      this.ui.volumeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.audio.setVolume(val);
      });
    }

    // Fullscreen Toggle
    this.ui.btnFullscreen.addEventListener('click', () => this.toggleFullscreen());

    // Keyboard Shortcuts (Space for Play/Pause, Left/Right for Seek 5s)
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        this.togglePlayPause();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        this.seekTo(Math.min(TOTAL_DURATION, this.masterTime + 5.0));
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        this.seekTo(Math.max(0, this.masterTime - 5.0));
      }
    });

    // Scene Navigation Cards Click
    document.querySelectorAll('.scene-card').forEach((card) => {
      card.addEventListener('click', () => {
        const time = parseFloat(card.dataset.start);
        this.seekTo(time);
        if (!this.isPlaying) {
          this.play();
        }
      });
    });
  }

  play() {
    if (this.masterTime >= TOTAL_DURATION) {
      this.masterTime = 0.0;
    }
    this.isPlaying = true;
    this.lastTimestamp = performance.now();
    this.audio.play(this.masterTime);
    this.updatePlayButtonUI();

    if (this.ui.stagePrompt) {
      this.ui.stagePrompt.classList.add('hidden');
    }

    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.animationLoop();
  }

  pause() {
    this.isPlaying = false;
    this.lastTimestamp = null;
    this.audio.pause();
    this.updatePlayButtonUI();

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  restart() {
    this.seekTo(0.0);
    this.play();
  }

  seekTo(targetSeconds) {
    this.masterTime = Math.max(0.0, Math.min(TOTAL_DURATION, targetSeconds));
    this.audio.seek(this.masterTime);
    this.renderCurrentFrame();
    this.updateTimelineUI();
    this.updateActiveSceneCard();

    // If reached end, pause cleanly
    if (this.masterTime >= TOTAL_DURATION && this.isPlaying) {
      this.pause();
    }
  }

  animationLoop() {
    if (!this.isPlaying) return;

    const now = performance.now();
    const dt = (now - this.lastTimestamp) / 1000.0;
    this.lastTimestamp = now;

    // Advance masterTime
    this.masterTime += dt;

    // Check if reached 120 seconds
    if (this.masterTime >= TOTAL_DURATION) {
      this.masterTime = TOTAL_DURATION;
      this.renderCurrentFrame();
      this.updateTimelineUI();
      this.pause();
      return; // Stop at exactly 120s, keep final frame visible, DO NOT LOOP
    }

    // Keep audio in sync (prevent drift)
    if (this.audio.isPlaying && Math.abs(this.audio.audio.currentTime - this.masterTime) > 0.4) {
      this.audio.seek(this.masterTime);
    }

    this.renderCurrentFrame();
    this.updateTimelineUI();
    this.updateActiveSceneCard();

    this.animationFrameId = requestAnimationFrame(() => this.animationLoop());
  }

  renderCurrentFrame() {
    this.animation.render(this.masterTime);
  }

  updatePlayButtonUI() {
    if (this.isPlaying) {
      this.ui.btnPlayPause.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" rx="1"/>
          <rect x="14" y="4" width="4" height="16" rx="1"/>
        </svg>
        <span>PAUSE</span>
      `;
    } else {
      this.ui.btnPlayPause.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
        <span>PLAY</span>
      `;
    }
  }

  updateTimelineUI() {
    const pct = (this.masterTime / TOTAL_DURATION) * 100;
    this.ui.timelineProgress.style.width = `${pct}%`;

    const formatTime = (sec) => {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    this.ui.timeCurrent.textContent = formatTime(this.masterTime);
    this.ui.timeTotal.textContent = "02:00";
  }

  updateActiveSceneCard() {
    const sceneIndex = Math.min(9, Math.floor(this.masterTime / 12.0));
    document.querySelectorAll('.scene-card').forEach((card, idx) => {
      if (idx === sceneIndex) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }

  toggleFullscreen() {
    const container = this.ui.playerCard;
    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }
}
