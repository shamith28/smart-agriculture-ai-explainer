/* ==========================================================================
   AI-POWERED SMART AGRICULTURE - SYNCHRONIZED AUDIO ENGINE
   ========================================================================== */

export class AudioManager {
  constructor() {
    this.soundtrackUrl = 'public/audio/soundtrack.mp3';
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.src = this.soundtrackUrl;
    this.isLoaded = false;
    this.isPlaying = false;
    this.volume = 1.0;

    this.audio.addEventListener('canplaythrough', () => {
      this.isLoaded = true;
    });

    this.audio.addEventListener('error', (e) => {
      console.warn("Soundtrack audio element error, checking relative fallback:", e);
    });
  }

  async play(masterTime = 0) {
    try {
      this.seek(masterTime);
      this.audio.volume = this.volume;
      await this.audio.play();
      this.isPlaying = true;
    } catch (err) {
      console.log("Audio autoplay prevented or waiting for interaction:", err.message);
      this.isPlaying = false;
    }
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
  }

  seek(masterTime) {
    if (Math.abs(this.audio.currentTime - masterTime) > 0.25) {
      this.audio.currentTime = Math.min(120.0, Math.max(0, masterTime));
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.audio.volume = this.volume;
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.isPlaying = false;
  }
}
