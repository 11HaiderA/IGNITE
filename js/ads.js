// AdService Interface with Web Mock Adapter and Capacitor/H5 stubs

class MockAdAdapter {
  isRewardedReady() {
    return true;
  }

  showRewarded() {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'ad-mock-overlay';
      overlay.innerHTML = `
        <div class="ad-mock-box">
          <div class="ad-mock-badge">SIMULATED REWARDED AD (MOCK)</div>
          <div class="ad-mock-content">
            <div class="ad-mock-icon">🔥</div>
            <h3>MATCHSTICKS PRO</h3>
            <p>Upgrade your brain. Ignite your mind with hundreds of arithmetic puzzles!</p>
            <div class="ad-mock-timer" id="adTimer">Reward in: <b id="adSecs">5</b>s</div>
          </div>
          <button id="adCloseBtn" class="ad-mock-close hidden">CLAIM HINT ✕</button>
        </div>
      `;

      document.body.appendChild(overlay);

      let timeLeft = 5;
      const secsEl = overlay.querySelector('#adSecs');
      const closeBtn = overlay.querySelector('#adCloseBtn');

      const interval = setInterval(() => {
        timeLeft--;
        if (secsEl) secsEl.textContent = timeLeft;
        if (timeLeft <= 0) {
          clearInterval(interval);
          const timerEl = overlay.querySelector('#adTimer');
          if (timerEl) timerEl.textContent = '🎉 Video Complete! Reward Earned!';
          if (closeBtn) closeBtn.classList.remove('hidden');
        }
      }, 1000);

      closeBtn.addEventListener('click', () => {
        clearInterval(interval);
        overlay.remove();
        resolve('rewarded');
      });
    });
  }
}

// Stubs for future native/web ad integrations
class CapacitorAdMobAdapter {
  isRewardedReady() {
    return false; // Stub: return window.Capacitor?.isPluginAvailable('AdMob')
  }
  async showRewarded() {
    // Stub: await AdMob.showRewardVideoAd(...)
    return 'failed';
  }
}

class GoogleH5GamesAdsAdapter {
  isRewardedReady() {
    return false; // Stub: return typeof adBreak === 'function'
  }
  async showRewarded() {
    return 'failed';
  }
}

class AdService {
  constructor() {
    this.adapter = new MockAdAdapter();
  }

  isRewardedReady() {
    return this.adapter.isRewardedReady();
  }

  async showRewarded() {
    try {
      return await this.adapter.showRewarded();
    } catch (e) {
      return 'failed';
    }
  }
}

export const ads = new AdService();
