import { audio } from '../audio.js';
import { storage } from '../storage.js';

export class SettingsModal {
  constructor(container, onClose) {
    this.container = container;
    this.onClose = onClose;
  }

  show() {
    audio.playPopup(true);
    const settings = storage.getSettings();

    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop';
    overlay.id = 'settingsModal';

    overlay.innerHTML = `
      <div class="modal-card settings-card">
        <button class="modal-close-btn" id="settingsClose" aria-label="Close">✕</button>
        <h2 class="modal-title">SETTINGS</h2>

        <div class="settings-list">
          <!-- Music -->
          <div class="setting-item">
            <div class="setting-row">
              <span class="setting-label">🎵 MUSIC</span>
              <label class="toggle-switch">
                <input type="checkbox" id="toggleMusic" ${settings.music ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <input type="range" class="volume-slider" id="sliderMusic" min="0" max="100" value="${settings.musicVol || 50}">
          </div>

          <!-- Sound FX -->
          <div class="setting-item">
            <div class="setting-row">
              <span class="setting-label">📢 SOUND FX</span>
              <label class="toggle-switch">
                <input type="checkbox" id="toggleSfx" ${settings.sfx ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <input type="range" class="volume-slider" id="sliderSfx" min="0" max="100" value="${settings.sfxVol || 80}">
          </div>

          <!-- Vibration -->
          <div class="setting-item">
            <div class="setting-row">
              <span class="setting-label">📳 VIBRATION</span>
              <label class="toggle-switch">
                <input type="checkbox" id="toggleVibration" ${settings.vibration ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <button class="btn btn-secondary btn-restore" id="btnRestore">
          RESTORE PURCHASES
        </button>

        <div class="settings-meta">
          <span>PRIVACY</span> · <span>TERMS</span> · <span>v1.0</span>
        </div>
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

    overlay.querySelector('#settingsClose').addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    // Inputs & listeners
    const toggleMusic = overlay.querySelector('#toggleMusic');
    const sliderMusic = overlay.querySelector('#sliderMusic');
    const toggleSfx = overlay.querySelector('#toggleSfx');
    const sliderSfx = overlay.querySelector('#sliderSfx');
    const toggleVibration = overlay.querySelector('#toggleVibration');

    const updateAudioSettings = () => {
      settings.music = toggleMusic.checked;
      settings.musicVol = parseInt(sliderMusic.value, 10);
      settings.sfx = toggleSfx.checked;
      settings.sfxVol = parseInt(sliderSfx.value, 10);
      settings.vibration = toggleVibration.checked;

      storage.saveSettings(settings);
      audio.setMusicSettings(settings.music, settings.musicVol);
      audio.setSfxSettings(settings.sfx, settings.sfxVol);
    };

    toggleMusic.addEventListener('change', updateAudioSettings);
    sliderMusic.addEventListener('input', updateAudioSettings);
    toggleSfx.addEventListener('change', () => {
      updateAudioSettings();
      audio.playClick();
    });
    sliderSfx.addEventListener('input', () => {
      updateAudioSettings();
      audio.playClick();
    });
    toggleVibration.addEventListener('change', () => {
      updateAudioSettings();
      if (toggleVibration.checked && navigator.vibrate) {
        navigator.vibrate(30);
      }
    });

    overlay.querySelector('#btnRestore').addEventListener('click', () => {
      audio.playClick();
      alert('Purchases restored: All premium features active!');
    });
  }
}
