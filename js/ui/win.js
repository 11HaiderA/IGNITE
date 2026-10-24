import { audio } from '../audio.js';

export class WinModal {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks; // { onNext, onRestart, onLevels, onHome }
  }

  show(data = {}) {
    const {
      levelId = 1,
      stars = 3,
      timeSec = 14,
    } = data;

    const titles = ['BRILLIANT!', 'GENIUS!', 'ON FIRE!', 'MAGNIFICENT!'];
    const title = titles[Math.floor(Math.random() * titles.length)];

    const mins = Math.floor(timeSec / 60);
    const secs = String(timeSec % 60).padStart(2, '0');
    const timeFormatted = `${mins}:${secs}`;

    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop win-backdrop';
    overlay.id = 'winModal';

    overlay.innerHTML = `
      <div class="modal-card win-card">
        <div class="level-ribbon">LEVEL ${levelId}</div>
        <h2 class="modal-title win-title">${title}</h2>

        <div class="win-stars-row" id="winStars">
          <span class="star-item star-1">★</span>
          <span class="star-item star-2">★</span>
          <span class="star-item star-3">★</span>
        </div>

        <div class="win-time-pill">
          SOLVED IN ${timeFormatted}
        </div>

        <button class="btn btn-primary btn-next-level" id="btnWinNext">
          NEXT LEVEL ➔
        </button>

        <div class="win-actions-row">
          <button class="icon-btn" id="btnWinRestart" title="Replay level">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          </button>
          <button class="icon-btn" id="btnWinLevels" title="Select level">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          </button>
          <button class="icon-btn" id="btnWinHome" title="Main menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    this.container.appendChild(overlay);

    // Staggered star animation
    const starEls = overlay.querySelectorAll('.star-item');
    for (let i = 0; i < stars; i++) {
      setTimeout(() => {
        if (starEls[i]) {
          starEls[i].classList.add('earned');
          audio.playStarPop(i + 1);
        }
      }, 400 + i * 280);
    }

    const close = (action) => {
      audio.playClick();
      overlay.classList.add('closing');
      setTimeout(() => {
        overlay.remove();
        action?.();
      }, 200);
    };

    overlay.querySelector('#btnWinNext').addEventListener('click', () => {
      close(this.callbacks.onNext);
    });

    overlay.querySelector('#btnWinRestart').addEventListener('click', () => {
      close(this.callbacks.onRestart);
    });

    overlay.querySelector('#btnWinLevels').addEventListener('click', () => {
      close(this.callbacks.onLevels);
    });

    overlay.querySelector('#btnWinHome').addEventListener('click', () => {
      close(this.callbacks.onHome);
    });
  }
}
