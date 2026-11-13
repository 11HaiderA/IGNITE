// MATCH STICKS — Production AdMob Service for Interstitial Ads
// App ID: ca-app-pub-8090216489030865~2763064514
// Ad Unit ID: ca-app-pub-8090216489030865/5022482067
// Test Unit ID: ca-app-pub-3940256099942544/1033173712

export const ADMOB_APP_ID = 'ca-app-pub-8090216489030865~2763064514';
export const ADMOB_INTERSTITIAL_ID = 'ca-app-pub-8090216489030865/5022482067';
export const TEST_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712';

let GoogleMobileAds = null;
let isNativeAdMobAvailable = false;
let checkedNative = false;

function getGoogleMobileAds() {
  if (checkedNative) return GoogleMobileAds;
  checkedNative = true;
  try {
    const mod = require('react-native-google-mobile-ads');
    if (mod) {
      GoogleMobileAds = mod;
      isNativeAdMobAvailable = true;
      return GoogleMobileAds;
    }
  } catch (_e) {
    isNativeAdMobAvailable = false;
    GoogleMobileAds = null;
  }
  return null;
}

class AdMobManager {
  constructor() {
    this.interstitial = null;
    this.isLoaded = false;
    this.isLoading = false;
    this.initStarted = false;
    this.currentUnitId = ADMOB_INTERSTITIAL_ID;
    this.onAdClosedCallback = null;
    this.pendingShowCallback = null;
    this.retryTimeout = null;
    this.retryAttempts = 0;
    this.unsubscribers = [];
  }

  async initialize() {
    if (this.initStarted) return;
    this.initStarted = true;

    try {
      const gma = getGoogleMobileAds();
      if (!gma) return;

      const initFn = gma.default || gma;
      if (typeof initFn === 'function') {
        await initFn().initialize();
      }
      this.createAndLoad();
    } catch (e) {
      if (__DEV__) console.warn('AdMob initialize error:', e);
    }
  }

  // Google Mobile Ads requires a fresh InterstitialAd instance for each impression.
  // Re-using a spent ad instance causes silent failure or "ad already shown" error.
  createAndLoad() {
    if (this.isLoading || this.isLoaded) return;

    const gma = getGoogleMobileAds();
    if (!gma) return;

    try {
      const InterstitialAd = gma.InterstitialAd || (gma.default && gma.default.InterstitialAd);
      const AdEventType = gma.AdEventType || (gma.default && gma.default.AdEventType);
      const TestIds = gma.TestIds || (gma.default && gma.default.TestIds);

      if (!InterstitialAd || !AdEventType) return;

      // Clean up previous listeners & instance
      this.cleanUpCurrentAd();

      // Use currentUnitId, or official Test ID if specified
      const unitId = this.currentUnitId || (TestIds ? TestIds.INTERSTITIAL : TEST_INTERSTITIAL_ID);

      this.interstitial = InterstitialAd.createForAdRequest(unitId, {
        requestNonPersonalizedAdsOnly: true,
      });

      const unsubLoaded = this.interstitial.addAdEventListener(AdEventType.LOADED, () => {
        this.isLoaded = true;
        this.isLoading = false;
        this.retryAttempts = 0;
        if (this.retryTimeout) {
          clearTimeout(this.retryTimeout);
          this.retryTimeout = null;
        }

        // If an ad show request was waiting for the load to finish:
        if (this.pendingShowCallback) {
          const showFn = this.pendingShowCallback;
          this.pendingShowCallback = null;
          showFn(true);
        }
      });

      const unsubClosed = this.interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        this.isLoaded = false;
        this.isLoading = false;
        // Always reset back to production ad unit so real ads are attempted first every time
        this.currentUnitId = ADMOB_INTERSTITIAL_ID;
        if (this.onAdClosedCallback) {
          const cb = this.onAdClosedCallback;
          this.onAdClosedCallback = null;
          cb();
        }
        // Immediately prepare the next fresh interstitial instance
        this.cleanUpCurrentAd();
        this.createAndLoad();
      });

      const unsubError = this.interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
        this.isLoaded = false;
        this.isLoading = false;
        if (__DEV__) console.warn('AdMob Interstitial load/show error:', error);

        // If live ad unit failed (e.g. unlinked app / closed testing Error 3: No fill),
        // fallback to Google official Test ID immediately so ads ALWAYS work for testing!
        if (this.currentUnitId === ADMOB_INTERSTITIAL_ID) {
          this.currentUnitId = (TestIds && TestIds.INTERSTITIAL) || TEST_INTERSTITIAL_ID;
          this.cleanUpCurrentAd();
          this.createAndLoad();
          return;
        }

        // If even the test unit failed or error occurred during show
        if (this.pendingShowCallback) {
          const showFn = this.pendingShowCallback;
          this.pendingShowCallback = null;
          showFn(false);
        }

        if (this.onAdClosedCallback) {
          const cb = this.onAdClosedCallback;
          this.onAdClosedCallback = null;
          cb();
        }

        this.cleanUpCurrentAd();

        // Exponential backoff retry
        this.retryAttempts = Math.min(this.retryAttempts + 1, 4);
        const delay = Math.min(30000, 4000 * Math.pow(1.5, this.retryAttempts - 1));
        if (this.retryTimeout) clearTimeout(this.retryTimeout);
        this.retryTimeout = setTimeout(() => {
          this.currentUnitId = ADMOB_INTERSTITIAL_ID;
          this.createAndLoad();
        }, delay);
      });

      this.unsubscribers = [unsubLoaded, unsubClosed, unsubError];
      this.isLoading = true;
      this.interstitial.load();
    } catch (e) {
      this.isLoading = false;
      this.isLoaded = false;
      if (this.pendingShowCallback) {
        const showFn = this.pendingShowCallback;
        this.pendingShowCallback = null;
        showFn(false);
      }
      if (__DEV__) console.warn('Error creating AdMob interstitial:', e);
    }
  }

  cleanUpCurrentAd() {
    if (this.unsubscribers && this.unsubscribers.length > 0) {
      this.unsubscribers.forEach((unsub) => {
        if (typeof unsub === 'function') {
          try {
            unsub();
          } catch (_e) {}
        }
      });
      this.unsubscribers = [];
    }
    this.interstitial = null;
  }

  showInterstitial({ onComplete, onFallback }) {
    const gma = getGoogleMobileAds();

    if (!isNativeAdMobAvailable || !gma) {
      if (onFallback) {
        onFallback();
      } else if (onComplete) {
        onComplete();
      }
      return false;
    }

    // 1. If ad is loaded and ready, show immediately!
    if (this.isLoaded && this.interstitial) {
      this.onAdClosedCallback = onComplete;
      try {
        this.interstitial.show();
        return true;
      } catch (err) {
        if (__DEV__) console.warn('AdMob show exception:', err);
        this.onAdClosedCallback = null;
        this.isLoaded = false;
        this.cleanUpCurrentAd();
        if (onFallback) {
          onFallback();
        } else if (onComplete) {
          onComplete();
        }
        this.createAndLoad();
        return false;
      }
    }

    // 2. If ad is currently loading or needs to start loading, wait up to 3.2 seconds for it!
    if (!this.isLoading) {
      this.createAndLoad();
    }

    let finished = false;
    const timeoutId = setTimeout(() => {
      if (!finished) {
        finished = true;
        this.pendingShowCallback = null;
        if (onFallback) {
          onFallback();
        } else if (onComplete) {
          onComplete();
        }
      }
    }, 3200);

    this.pendingShowCallback = (success) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeoutId);

      if (success && this.interstitial) {
        this.onAdClosedCallback = onComplete;
        try {
          this.interstitial.show();
        } catch (e) {
          this.onAdClosedCallback = null;
          this.cleanUpCurrentAd();
          if (onFallback) {
            onFallback();
          } else if (onComplete) {
            onComplete();
          }
          this.createAndLoad();
        }
      } else {
        if (onFallback) {
          onFallback();
        } else if (onComplete) {
          onComplete();
        }
      }
    };

    return true;
  }
}

export const adMobService = new AdMobManager();
export default adMobService;
