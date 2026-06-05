import { useBilling } from '../context/BillingContext';

/**
 * Exposes billing state and purchase actions through a stable hook interface.
 * All heavy lifting lives in BillingContext; this hook is the public surface
 * components import so the internal context shape can change without touching
 * call sites.
 */
export function useInAppBilling() {
  const { isAdsRemoved, purchaseAdsRemoval, restorePurchases } = useBilling();

  return {
    isAdsRemoved,
    purchaseAdsRemoval,
    restorePurchases,
  };
}
