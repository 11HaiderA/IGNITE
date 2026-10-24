import { audio } from '../audio.js';
import { storage } from '../storage.js';

export class HowToPlayModal {
  constructor(container, onClose) {
    this.container = container;
    this.onClose = onClose;
    this.page = 0;
  }

  show() {
    audio.playPopup(true);

    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop';
    overlay.id = 'howToPlayModal';

    overlay.innerHTML = `
      <div class="modal-card">
        <button class="modal-close-btn" id="htpClose" aria-label="Close">✕</button>
        <h2 class="modal-title">HOW TO PLAY</h2>

        <div class="htp-carousel" id="htpContent">
          <!-- Page 1 -->
          <div class="htp-page ${this.page === 0 ? 'active' : ''}" data-page="0">
            <div class="htp-demo-board">
              <svg viewBox="0 0 180 80" class="htp-demo-svg">
                <!-- 7 - 2 = 8 mini demo -->
                <text x="18" y="55" fill="#f7d89a" font-size="44" font-family="Oswald">7</text>
                <text x="50" y="52" fill="#ffb347" font-size="40" font-family="Oswald">+</text>
                <text x="82" y="55" fill="#f7d89a" font-size="44" font-family="Oswald">2</text>
                <text x="114" y="53" fill="#f7d89a" font-size="40" font-family="Oswald">=</text>
                <text x="146" y="55" fill="#ff4436" font-size="44" font-family="Oswald">9</text>
                <path d="M 54 28 Q 100 10 152 24" fill="none" stroke="#ffb347" stroke-width="2.5" stroke-dasharray="4,4" class="htp-demo-arc"/>
              </svg>
            </div>
            <p class="htp-text">Move <b class="hl-hot">ONE</b> matchstick to make the equation true.</p>
            <p class="htp-subtext">Drag a stick · drop it on a glowing slot</p>
          </div>

          <!-- Page 2 -->
          <div class="htp-page ${this.page === 1 ? 'active' : ''}" data-page="1">
            <div class="htp-icon-row">
              <span class="htp-badge-icon">👆</span>
              <span class="htp-arrow">➔</span>
              <span class="htp-badge-icon">✨</span>
            </div>
            <p class="htp-text">Drag & drop or tap-to-move.</p>
            <p class="htp-subtext">Tap any stick to pick it up, then tap any dashed outline to place it.</p>
          </div>

          <!-- Page 3 -->
          <div class="htp-page ${this.page === 2 ? 'active' : ''}" data-page="2">
            <div class="htp-icon-row">
              <span class="htp-badge-icon">💡</span>
              <span class="htp-badge-icon">⭐⭐⭐</span>
            </div>
            <p class="htp-text">Need help? Watch an ad for a hint.</p>
            <p class="htp-subtext">Fewer moves & faster time unlock all 3 stars on every puzzle!</p>
          </div>
        </div>

        <div class="carousel-dots" id="htpDots">
          <span class="dot ${this.page === 0 ? 'active' : ''}"></span>
          <span class="dot ${this.page === 1 ? 'active' : ''}"></span>
          <span class="dot ${this.page === 2 ? 'active' : ''}"></span>
        </div>

        <button class="btn btn-primary htp-next-btn" id="htpNext">
          ${this.page === 2 ? 'GOT IT!' : 'NEXT >'}
        </button>
      </div>
    `;

    this.container.appendChild(overlay);

    const close = () => {
      audio.playPopup(false);
      overlay.classList.add('closing');
      const prog = storage.getProgress();
      prog.howToPlaySeen = true;
      storage.saveProgress(prog);
      setTimeout(() => {
        overlay.remove();
        this.onClose?.();
      }, 200);
    };

    overlay.querySelector('#htpClose').addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    const nextBtn = overlay.querySelector('#htpNext');
    nextBtn.addEventListener('click', () => {
      audio.playClick();
      if (this.page < 2) {
        this.page++;
        this.updatePage(overlay);
      } else {
        close();
      }
    });
  }

  updatePage(overlay) {
    const pages = overlay.querySelectorAll('.htp-page');
    pages.forEach((p, idx) => {
      p.classList.toggle('active', idx === this.page);
    });

    const dots = overlay.querySelectorAll('.carousel-dots .dot');
    dots.forEach((d, idx) => {
      d.classList.toggle('active', idx === this.page);
    });

    const nextBtn = overlay.querySelector('#htpNext');
    nextBtn.textContent = this.page === 2 ? 'GOT IT!' : 'NEXT >';
  }
}
