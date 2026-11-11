// MATCH STICKS — Production AdMob Service for Interstitial Ads
// App ID: ca-app-pub-8090216489030865~9846910244
// Ad Unit ID: ca-app-pub-8090216489030865/6886980079

export const ADMOB_APP_ID = 'ca-app-pub-8090216489030865~9846910244';
export const ADMOB_INTERSTITIAL_ID = 'ca-app-pub-8090216489030865/6886980079';

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
    this.onAdClosedCallback = null;
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

      // In development / emulator, use Google's official test interstitial ID
      const unitId = __DEV__ && TestIds ? TestIds.INTERSTITIAL : ADMOB_INTERSTITIAL_ID;

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
      });

      const unsubClosed = this.interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        this.isLoaded = false;
        this.isLoading = false;
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

        // If an ad was mid-show, ensure the game callback still fires
        if (this.onAdClosedCallback) {
          const cb = this.onAdClosedCallback;
          this.onAdClosedCallback = null;
          cb();
        }

        this.cleanUpCurrentAd();

        // Exponential backoff retry (5s, 10s, 20s, up to 30s)
        this.retryAttempts = Math.min(this.retryAttempts + 1, 4);
        const delay = Math.min(30000, 5000 * Math.pow(1.5, this.retryAttempts - 1));
        if (this.retryTimeout) clearTimeout(this.retryTimeout);
        this.retryTimeout = setTimeout(() => {
          this.createAndLoad();
        }, delay);
      });

      this.unsubscribers = [unsubLoaded, unsubClosed, unsubError];
      this.isLoading = true;
      this.interstitial.load();
    } catch (e) {
      this.isLoading = false;
      this.isLoaded = false;
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
    if (isNativeAdMobAvailable && this.interstitial && this.isLoaded) {
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
    } else {
      // In Expo Go, during network buffering, or when offline:
      // Trigger fallback so the player's reward and gameplay are never blocked.
      if (onFallback) {
        onFallback();
      } else if (onComplete) {
        onComplete();
      }
      this.createAndLoad();
      return false;
    }
  }
}

export const adMobService = new AdMobManager();
export default adMobService;
