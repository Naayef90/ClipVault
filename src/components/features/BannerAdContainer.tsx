import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';
import { useInAppBilling } from '../../hooks/useInAppBilling';

const BANNER_AD_UNIT_ID = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : 'ca-app-pub-5218574173760069/3961887771';

/**
 * Renders an adaptive smart banner docked to the bottom of the screen.
 *
 * Mounting behaviour:
 * - Completely unmounts the BannerAd component tree when isAdsRemoved is true
 *   so no ad SDK code runs at all — no background fetches, no layout impact.
 * - The container height collapses to 0 gracefully so the parent layout
 *   does not shift when ads are removed mid-session.
 */
export function BannerAdContainer() {
  const { isAdsRemoved } = useInAppBilling();
  const [adFailed, setAdFailed] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  if (isAdsRemoved || adFailed) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdFailedToLoad={() => {
          if (mountedRef.current) setAdFailed(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
});
