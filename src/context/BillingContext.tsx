import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { BillingStorage } from '../storage/BillingStorage';
import AdScheduler from '../services/AdScheduler';

interface BillingContextValue {
  isAdsRemoved: boolean;
  purchaseAdsRemoval: () => Promise<void>;
  restorePurchases: () => Promise<void>;
}

const BillingContext = createContext<BillingContextValue | null>(null);

export function BillingProvider({ children }: { children: React.ReactNode }) {
  const [isAdsRemoved, setIsAdsRemoved] = useState(false);

  useEffect(() => {
    const stored = BillingStorage.getIsAdsRemoved();
    setIsAdsRemoved(stored);

    if (stored) {
      // Hard-abort all AdMob engine lifecycles immediately to preserve battery
      // and prevent background network calls for ad data.
      AdScheduler.getInstance().disable();
    } else {
      AdScheduler.getInstance().initialize();
    }

    return () => {
      AdScheduler.getInstance().destroy();
    };
  }, []);

  const applyAdsRemoved = useCallback(() => {
    BillingStorage.setIsAdsRemoved(true);
    setIsAdsRemoved(true);
    AdScheduler.getInstance().disable();
  }, []);

  const purchaseAdsRemoval = useCallback(async (): Promise<void> => {
    throw new Error('In-app purchases are not yet available.');
  }, []);

  const restorePurchases = useCallback(async (): Promise<void> => {
    throw new Error('In-app purchases are not yet available.');
  }, []);

  const value = useMemo<BillingContextValue>(
    () => ({ isAdsRemoved, purchaseAdsRemoval, restorePurchases }),
    [isAdsRemoved, purchaseAdsRemoval, restorePurchases],
  );

  return (
    <BillingContext.Provider value={value}>{children}</BillingContext.Provider>
  );
}

export function useBilling(): BillingContextValue {
  const ctx = useContext(BillingContext);
  if (!ctx) throw new Error('useBilling must be used within BillingProvider');
  return ctx;
}
