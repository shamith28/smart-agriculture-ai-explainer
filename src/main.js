/* ==========================================================================
   AI-POWERED SMART AGRICULTURE - APPLICATION ENTRY POINT
   ========================================================================== */

import { SmartFarmAnimation } from './animation.js';
import { AudioManager } from './audio.js';
import { VideoPlayer } from './player.js';
import { VideoExportManager } from './export.js';

document.addEventListener('DOMContentLoaded', () => {
  const stageCanvas = document.getElementById('presentation-canvas');
  if (!stageCanvas) {
    console.error("Presentation canvas element not found!");
    return;
  }

  // UI elements registry
  const ui = {
    playerCard: document.getElementById('player-card'),
    stageCanvas: stageCanvas,
    stagePrompt: document.getElementById('stage-prompt'),
    btnPlayPause: document.getElementById('btn-play-pause'),
    btnRestart: document.getElementById('btn-restart'),
    timelineWrapper: document.getElementById('timeline-wrapper'),
    timelineProgress: document.getElementById('timeline-progress'),
    timeCurrent: document.getElementById('time-current'),
    timeTotal: document.getElementById('time-total'),
    volumeSlider: document.getElementById('volume-slider'),
    btnFullscreen: document.getElementById('btn-fullscreen'),
    btnExport: document.getElementById('btn-export'),
    modalBackdrop: document.getElementById('modal-backdrop'),
    modalClose: document.getElementById('modal-close')
  };

  // Initialize Engines
  const animation = new SmartFarmAnimation(stageCanvas);
  const audio = new AudioManager();
  const player = new VideoPlayer(animation, audio, ui);
  const exportManager = new VideoExportManager(ui);

  // Expose player globally for debugging or external triggers
  window.farmPlayer = player;
  window.farmAnimation = animation;
  window.seekTo = (t) => player.seekTo(t);
  window.renderFrameAndGetJPEG = (t) => {
    player.seekTo(t);
    const dataUrl = stageCanvas.toDataURL('image/jpeg', 0.92);
    return dataUrl.substring(dataUrl.indexOf(',') + 1);
  };

  console.log("AI-Powered Smart Agriculture System initialized successfully.");
});
