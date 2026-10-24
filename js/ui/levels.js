import { audio } from '../audio.js';
import { storage } from '../storage.js';

export class LevelsModal {
  constructor(container, onSelectLevel, onClose) {
    this.container = container;
    this.onSelectLevel = onSelectLevel;
    this.onClose = onClose;
    this.page = 0; // 20 per page
    this.pageSize = 20;
    this.totalLevels = 100;
  }

  show() {
    audio.playPopup(true);
    const prog = storage.getProgress();
    const unlocked = prog.unlockedLevel || 1;
    this.page = Math.floor((unlocked - 1) / this.pageSize);

    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop';
    overlay.id = 'levelsModal';

    overlay.innerHTML = `
      <div class="modal-card levels-card">
        <button class="modal-close-btn" id="levelsClose" aria-label="Close">✕</button>
        <h2 class="modal-title">SELECT LEVEL</h2>

        <div class="levels-pagination-bar">
          <button class="page-nav-btn" id="btnPagePrev">◀</button>
          <span class="page-indicator" id="pageIndicator">Levels 1 - 20</span>
          <button class="page-nav-btn" id="btnPageNext">▶</button>
        </div>

        <div class="levels-grid" id="levelsGrid"></div>
      </div>
    `;

    this.container.appendChild(overlay);

    const close = () => {
      audio.playPopup(false);
      overlay.classList.add('closing');
      setTimeout(() => {
        overlay.remove();
        this.onClose?.();
      }, 200);
    };

    overlay.querySelector('#levelsClose').addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    const updateGrid = () => {
      const grid = overlay.querySelector('#levelsGrid');
      const startIdx = this.page * this.pageSize + 1;
      const endIdx = Math.min(this.totalLevels, startIdx + this.pageSize - 1);
      overlay.querySelector('#pageIndicator').textContent = `Levels ${startIdx} - ${endIdx}`;

      grid.innerHTML = '';
      for (let i = startIdx; i <= endIdx; i++) {
        const isUnlocked = i <= unlocked;
        const isCurrent = i === unlocked;
        const stars = prog.stars[i] || 0;

        const tile = document.createElement('button');
        tile.className = `level-tile ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}`;
        tile.dataset.level = i;

        if (isUnlocked) {
          tile.innerHTML = `
            <span class="tile-number">${i}</span>
            <div class="tile-stars">
              <span class="mini-star ${stars >= 1 ? 'earned' : ''}">★</span>
              <span class="mini-star ${stars >= 2 ? 'earned' : ''}">★</span>
              <span class="mini-star ${stars >= 3 ? 'earned' : ''}">★</span>
            </div>
          `;
          tile.addEventListener('click', () => {
            audio.playClick();
            close();
            this.onSelectLevel?.(i);
          });
        } else {
          tile.innerHTML = `
            <span class="tile-lock">🔒</span>
            <span class="tile-number-locked">${i}</span>
          `;
        }

        grid.appendChild(tile);
      }
    };

    overlay.querySelector('#btnPagePrev').addEventListener('click', () => {
      if (this.page > 0) {
        audio.playClick();
        this.page--;
        updateGrid();
      }
    });

    overlay.querySelector('#btnPageNext').addEventListener('click', () => {
      const maxPages = Math.ceil(this.totalLevels / this.pageSize) - 1;
      if (this.page < maxPages) {
        audio.playClick();
        this.page++;
        updateGrid();
      }
    });

    updateGrid();
  }
}
