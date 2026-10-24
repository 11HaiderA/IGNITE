import { audio } from '../audio.js';
import { ads } from '../ads.js';

export class HintModal {
  constructor(container, onRewarded, onCancel) {
    this.container = container;
    this.onRewarded = onRewarded;
    this.onCancel = onCancel;
  }

  show() {
    audio.playPopup(true);

    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop';
    overlay.id = 'hintModal';

    overlay.innerHTML = `
      <div class="modal-card hint-card">
        <button class="modal-close-btn" id="hintClose" aria-label="Close">✕</button>

        <div class="hint-icon-glow">
          <span class="bulb-icon">💡</span>
        </div>

        <h2 class="modal-title">NEED A HINT?</h2>
        <p class="hint-desc">Watch a short video to reveal which stick to move.</p>

        <div class="hint-actions">
          <button class="btn btn-primary btn-watch-ad" id="btnWatchAd">
            <span class="btn-icon">▶</span> WATCH AD
          </button>
          <button class="btn btn-secondary" id="btnNoThanks">
            NO THANKS
          </button>
        </div>
      </div>
    `;

    this.container.appendChild(overlay);

    const close = (rewarded = false) => {
      audio.playPopup(false);
      overlay.classList.add('closing');
      setTimeout(() => {
        overlay.remove();
        if (rewarded) {
          this.onRewarded?.();
        } else {
          this.onCancel?.();
        }
      }, 200);
    };

    overlay.querySelector('#hintClose').addEventListener('click', () => close(false));
    overlay.querySelector('#btnNoThanks').addEventListener('click', () => {
      audio.playClick();
      close(false);
    });

    overlay.querySelector('#btnWatchAd').addEventListener('click', async () => {
      audio.playClick();
      const res = await ads.showRewarded();
      if (res === 'rewarded') {
        close(true);
      } else {
        alert('Video not available. Please try again in a moment.');
        close(false);
      }
    });
  }
}
