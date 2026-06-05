import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

/**
 * Isolated singleton that tracks write-operation counts and presents an
 * interstitial ad only after a threshold is crossed.
 *
 * Rules enforced here:
 * - Ads fire only after "Create" or "Edit" write commits (never on copy tap).
 * - Once disabled (ads-removed purchase), the ad engine is fully torn down and
 *   no further loads or event listeners are attached.
 * - The ad is pre-loaded in the background and only shown when already cached
 *   to avoid blocking the UI thread.
 */
const INTERSTITIAL_AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-5218574173760069/9229536646';

const WRITE_THRESHOLD = 3;

class AdScheduler {
  private static _instance: AdScheduler;

  private ad: InterstitialAd;
  private adLoaded = false;
  private enabled = false;
  private operationCount = 0;
  private unsubscribeLoaded: (() => void) | null = null;
  private unsubscribeClosed: (() => void) | null = null;
  private unsubscribeError: (() => void) | null = null;

  private constructor() {
    this.ad = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: true,
      keywords: ['productivity', 'utilities'],
    });
  }

  static getInstance(): AdScheduler {
    if (!AdScheduler._instance) {
      AdScheduler._instance = new AdScheduler();
    }
    return AdScheduler._instance;
  }

  initialize(): void {
    if (this.enabled) return;
    this.enabled = true;

    this.unsubscribeLoaded = this.ad.addAdEventListener(
      AdEventType.LOADED,
      () => {
        this.adLoaded = true;
      },
    );

    this.unsubscribeClosed = this.ad.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        this.adLoaded = false;
        if (this.enabled) this.loadAd();
      },
    );

    this.unsubscribeError = this.ad.addAdEventListener(
      AdEventType.ERROR,
      () => {
        this.adLoaded = false;
      },
    );

    this.loadAd();
  }

  /**
   * Called after every confirmed "Create" or "Edit" write. Increments the
   * operation counter and shows a cached interstitial once the threshold is met.
   */
  onWriteCommit(): void {
    if (!this.enabled) return;

    this.operationCount += 1;

    if (this.operationCount >= WRITE_THRESHOLD && this.adLoaded) {
      this.operationCount = 0;
      this.ad.show().catch(() => {
        // Show failed silently — ad may have expired; reload for next time.
        this.loadAd();
      });
    }
  }

  /**
   * Hard-aborts all ad engine lifecycles. Called when the user purchases
   * "Remove Ads" so no further network requests are made.
   */
  disable(): void {
    this.enabled = false;
    this.operationCount = 0;
    this.adLoaded = false;
    this.detachListeners();
  }

  destroy(): void {
    this.detachListeners();
  }

  private loadAd(): void {
    if (this.enabled) {
      this.ad.load();
    }
  }

  private detachListeners(): void {
    this.unsubscribeLoaded?.();
    this.unsubscribeClosed?.();
    this.unsubscribeError?.();
    this.unsubscribeLoaded = null;
    this.unsubscribeClosed = null;
    this.unsubscribeError = null;
  }
}

export default AdScheduler;
