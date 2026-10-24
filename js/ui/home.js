import { audio } from '../audio.js';
import { storage } from '../storage.js';

export class HomeScreen {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks; // { onPlay, onHowToPlay, onSettings, onLevels }
  }

  show() {
    const prog = storage.getProgress();
    const stats = storage.getStats();
    const totalStars = storage.getTotalStars();
    const curLevel = prog.unlockedLevel || 1;

    this.container.innerHTML = `
      <div class="screen home-screen" id="homeScreen">
        <header class="home-header">
          <div class="streak-chip">
            <span class="fire-icon">🔥</span>
            <span class="streak-val">${stats.streak || 1}</span>
          </div>
          <button class="icon-btn" id="btnHomeSettings" aria-label="Settings">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </header>

        <div class="home-hero">
          <!-- Crossed Matchsticks Artwork -->
          <div class="crossed-matches-wrap">
            <svg class="crossed-matches-svg" viewBox="0 0 220 220">
              <!-- Left stick -->
              <g transform="rotate(-38 110 110)">
                <rect x="103" y="20" width="14" height="180" rx="3" fill="url(#woodGrad)"/>
                <ellipse cx="110" cy="18" rx="10" ry="12" fill="url(#headGrad)"/>
                <ellipse cx="107" cy="14" rx="2.5" ry="2" fill="#fff" opacity="0.8"/>
              </g>
              <!-- Right stick (burning) -->
              <g transform="rotate(38 110 110)">
                <rect x="103" y="20" width="14" height="180" rx="3" fill="url(#woodGrad)"/>
                <ellipse cx="110" cy="18" rx="10" ry="12" fill="url(#headGrad)"/>
                <ellipse cx="107" cy="14" rx="2.5" ry="2" fill="#fff" opacity="0.8"/>
              </g>
            </svg>
            <div class="home-torch-flame">
              <div class="flame-layer flame-outer"></div>
              <div class="flame-layer flame-mid"></div>
              <div class="flame-layer flame-inner"></div>
            </div>
          </div>

          <h1 class="home-title">
            <span class="logo-match">MATCH</span>
            <span class="logo-sticks">STICKS</span>
          </h1>
        </div>

        <div class="home-actions">
          <button class="btn btn-primary btn-play" id="btnPlayGame">
            <span class="btn-icon">▶</span> PLAY
          </button>
          <button class="btn btn-secondary" id="btnHowToPlay">
            ? HOW TO PLAY
          </button>
        </div>

        <footer class="home-footer">
          <div class="level-progress-link" id="btnOpenLevels" title="Tap to select level">
            LEVEL ${curLevel} · ${totalStars} ★
          </div>
        </footer>
      </div>
    `;

    // Event listeners
    this.container.querySelector('#btnPlayGame').addEventListener('click', () => {
      audio.playClick();
      this.callbacks.onPlay?.(curLevel);
    });

    this.container.querySelector('#btnHowToPlay').addEventListener('click', () => {
      audio.playClick();
      this.callbacks.onHowToPlay?.();
    });

    this.container.querySelector('#btnHomeSettings').addEventListener('click', () => {
      audio.playClick();
      this.callbacks.onSettings?.();
    });

    this.container.querySelector('#btnOpenLevels').addEventListener('click', () => {
      audio.playClick();
      this.callbacks.onLevels?.();
    });
  }
}
