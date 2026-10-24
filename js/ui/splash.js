import { audio } from '../audio.js';

export class SplashScreen {
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.skipped = false;
    this.canSkip = false;
  }

  show() {
    this.container.innerHTML = `
      <div class="screen splash-screen" id="splashScreen">
        <div class="splash-match-wrap">
          <svg class="splash-match-svg" viewBox="0 0 240 240">
            <!-- Diagonal big matchstick -->
            <g transform="rotate(-40 120 120)">
              <!-- Wood stick -->
              <rect x="112" y="80" width="16" height="150" rx="4" fill="url(#woodGrad)" class="splash-stick-body"/>
              <!-- Head -->
              <ellipse cx="120" cy="74" rx="13" ry="15" fill="url(#headGrad)" class="splash-stick-head"/>
              <ellipse cx="116" cy="69" rx="3.5" ry="3" fill="#ffffff" opacity="0.8"/>
            </g>
          </svg>
          <div class="splash-flame-wrapper hidden" id="splashFlame">
            <div class="flame-layer flame-outer"></div>
            <div class="flame-layer flame-mid"></div>
            <div class="flame-layer flame-inner"></div>
            <div class="flame-glow"></div>
          </div>
        </div>

        <div class="splash-brand">
          <h1 class="splash-logo">
            <span class="logo-match">MATCH</span>
            <span class="logo-sticks">STICKS</span>
          </h1>
          <p class="splash-tagline">IGNITE YOUR MIND</p>
        </div>

        <div class="splash-loader-bar">
          <div class="splash-loader-progress" id="splashProgress"></div>
        </div>

        <div class="splash-skip-hint">TAP ANYWHERE TO START</div>
      </div>
    `;

    const screenEl = this.container.querySelector('#splashScreen');
    const flameEl = this.container.querySelector('#splashFlame');
    const progEl = this.container.querySelector('#splashProgress');

    // First tap unlocks audio and allows skip
    const onUserTap = () => {
      audio.unlock();
      if (this.canSkip && !this.skipped) {
        this.finish();
      }
    };
    screenEl.addEventListener('pointerdown', onUserTap);

    // Sequence timeline
    setTimeout(() => {
      this.canSkip = true;
    }, 1000);

    // 0.4s: Strike & ignite
    setTimeout(() => {
      if (this.skipped) return;
      audio.playStrike();
      setTimeout(() => {
        if (this.skipped) return;
        flameEl.classList.remove('hidden');
        audio.playIgnite();
      }, 180);
    }, 400);

    // Progress bar fill over 2.4s
    requestAnimationFrame(() => {
      progEl.style.width = '100%';
    });

    // Complete splash
    setTimeout(() => {
      this.finish();
    }, 2800);
  }

  finish() {
    if (this.skipped) return;
    this.skipped = true;
    const screenEl = this.container.querySelector('#splashScreen');
    if (screenEl) {
      screenEl.classList.add('fade-out');
      setTimeout(() => {
        this.container.innerHTML = '';
        this.onComplete?.();
      }, 350);
    } else {
      this.onComplete?.();
    }
  }
}
