// IGNITE — Production AdMob Service for Interstitial Ads
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
  } catch (e) {
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
      this.setupInterstitial();
    } catch (e) {
      if (__DEV__) console.warn('AdMob initialize error:', e);
    }
  }

  setupInterstitial() {
    const gma = getGoogleMobileAds();
    if (!gma) return;

    try {
      const InterstitialAd = gma.InterstitialAd || (gma.default && gma.default.InterstitialAd);
      const AdEventType = gma.AdEventType || (gma.default && gma.default.AdEventType);
      const TestIds = gma.TestIds || (gma.default && gma.default.TestIds);

      if (!InterstitialAd) return;

      // In standalone / production build, use user's verified AdMob ID
      const unitId = __DEV__ && TestIds ? TestIds.INTERSTITIAL : ADMOB_INTERSTITIAL_ID;

      this.interstitial = InterstitialAd.createForAdRequest(unitId, {
        requestNonPersonalizedAdsOnly: true,
      });

      this.interstitial.addAdEventListener(AdEventType.LOADED, () => {
        this.isLoaded = true;
        this.isLoading = false;
      });

      this.interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        this.isLoaded = false;
        if (this.onAdClosedCallback) {
          const cb = this.onAdClosedCallback;
          this.onAdClosedCallback = null;
          cb();
        }
        // Automatically preload the next ad
        this.loadNext();
      });

      this.interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
        this.isLoaded = false;
        this.isLoading = false;
        if (__DEV__) console.warn('AdMob Interstitial error:', error);
      });

      this.loadNext();
    } catch (e) {
      if (__DEV__) console.warn('Error setting up AdMob interstitial:', e);
    }
  }

  loadNext() {
    if (!this.interstitial || this.isLoading || this.isLoaded) return;
    try {
      this.isLoading = true;
      this.interstitial.load();
    } catch (e) {
      this.isLoading = false;
    }
  }

  showInterstitial({ onComplete, onFallback }) {
    if (isNativeAdMobAvailable && this.interstitial && this.isLoaded) {
      this.onAdClosedCallback = onComplete;
      try {
        this.interstitial.show();
        return true;
      } catch (err) {
        this.onAdClosedCallback = null;
        if (onFallback) onFallback();
        return false;
      }
    } else {
      // In Expo Go or when ad is buffering, seamlessly fallback so gameplay is never blocked
      if (onFallback) {
        onFallback();
      } else if (onComplete) {
        onComplete();
      }
      this.loadNext();
      return false;
    }
  }
}

export const adMobService = new AdMobManager();
export default adMobService;
