import { audio } from '../audio.js';

export class PauseModal {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks; // { onResume, onRestart, onLevels, onHome }
  }

  show() {
    audio.playPopup(true);

    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop';
    overlay.id = 'pauseModal';

    overlay.innerHTML = `
      <div class="modal-card pause-card" id="pauseCard">
        <!-- Main Pause View -->
        <div class="pause-main-view" id="pauseMain">
          <h2 class="modal-title">PAUSED</h2>
          <div class="pause-actions">
            <button class="btn btn-primary" id="btnResume">
              <span class="btn-icon">▶</span> RESUME
            </button>
            <button class="btn btn-secondary" id="btnRestart">
              ↺ RESTART
            </button>
            <button class="btn btn-secondary" id="btnLevels">
              ▦ LEVELS
            </button>
            <button class="btn btn-secondary" id="btnHome">
              ⌂ MAIN MENU
            </button>
          </div>
        </div>

        <!-- In-card Confirm View -->
        <div class="pause-confirm-view hidden" id="pauseConfirm">
          <h3 class="confirm-title" id="confirmTitle">Restart Level?</h3>
          <p class="confirm-desc" id="confirmDesc">Your current move progress will be reset.</p>
          <div class="confirm-actions">
            <button class="btn btn-primary" id="btnConfirmYes">YES</button>
            <button class="btn btn-secondary" id="btnConfirmNo">NO</button>
          </div>
        </div>
      </div>
    `;

    this.container.appendChild(overlay);

    const mainView = overlay.querySelector('#pauseMain');
    const confirmView = overlay.querySelector('#pauseConfirm');
    const confirmTitle = overlay.querySelector('#confirmTitle');
    const confirmDesc = overlay.querySelector('#confirmDesc');
    let pendingAction = null;

    const showConfirm = (title, desc, action) => {
      audio.playClick();
      confirmTitle.textContent = title;
      confirmDesc.textContent = desc;
      pendingAction = action;
      mainView.classList.add('hidden');
      confirmView.classList.remove('hidden');
    };

    const hideConfirm = () => {
      audio.playClick();
      pendingAction = null;
      confirmView.classList.add('hidden');
      mainView.classList.remove('hidden');
    };

    const close = () => {
      audio.playPopup(false);
      overlay.classList.add('closing');
      setTimeout(() => {
        overlay.remove();
      }, 200);
    };

    overlay.querySelector('#btnResume').addEventListener('click', () => {
      audio.playClick();
      close();
      this.callbacks.onResume?.();
    });

    overlay.querySelector('#btnRestart').addEventListener('click', () => {
      showConfirm('Restart Level?', 'Reset current board to start?', () => {
        close();
        this.callbacks.onRestart?.();
      });
    });

    overlay.querySelector('#btnLevels').addEventListener('click', () => {
      showConfirm('Go to Levels?', 'Leave current puzzle and select level?', () => {
        close();
        this.callbacks.onLevels?.();
      });
    });

    overlay.querySelector('#btnHome').addEventListener('click', () => {
      showConfirm('Return to Menu?', 'Exit current puzzle to home screen?', () => {
        close();
        this.callbacks.onHome?.();
      });
    });

    overlay.querySelector('#btnConfirmYes').addEventListener('click', () => {
      audio.playClick();
      if (pendingAction) pendingAction();
    });

    overlay.querySelector('#btnConfirmNo').addEventListener('click', hideConfirm);
  }
}
