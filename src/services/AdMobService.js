// Match Sticks — Production AdMob Service for Interstitial Ads
// App ID: ca-app-pub-8090216489030865~9846910244
// Ad Unit ID: ca-app-pub-8090216489030865/6886980079

import { Platform } from 'react-native';

export const ADMOB_APP_ID = 'ca-app-pub-8090216489030865~9846910244';
export const ADMOB_INTERSTITIAL_ID = 'ca-app-pub-8090216489030865/6886980079';

let GoogleMobileAds = null;
let isNativeAdMobAvailable = false;

try {
  // Dynamically require to avoid crashing in environments without native binary (Expo Go, web)
  GoogleMobileAds = require('react-native-google-mobile-ads');
  if (GoogleMobileAds && GoogleMobileAds.InterstitialAd) {
    isNativeAdMobAvailable = true;
  }
} catch (e) {
  isNativeAdMobAvailable = false;
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
    if (this.initStarted || !isNativeAdMobAvailable) return;
    this.initStarted = true;

    try {
      if (GoogleMobileAds.default) {
        await GoogleMobileAds.default().initialize();
      }
      this.setupInterstitial();
    } catch (e) {
      if (__DEV__) console.warn('AdMob initialize error:', e);
    }
  }

  setupInterstitial() {
    if (!isNativeAdMobAvailable) return;

    try {
      const { InterstitialAd, AdEventType, TestIds } = GoogleMobileAds;
      // In standalone / production build, use user's verified AdMob ID
      const unitId = __DEV__ ? TestIds.INTERSTITIAL : ADMOB_INTERSTITIAL_ID;

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
