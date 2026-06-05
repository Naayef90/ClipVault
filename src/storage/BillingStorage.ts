import { getMMKV } from './mmkvInstance';

const ADS_REMOVED_KEY = 'billing_ads_removed_v1';

export const BillingStorage = {
  getIsAdsRemoved(): boolean {
    return getMMKV().getBoolean(ADS_REMOVED_KEY) ?? false;
  },

  setIsAdsRemoved(value: boolean): void {
    getMMKV().set(ADS_REMOVED_KEY, value);
  },
};
