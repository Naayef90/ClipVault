import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { initializeMMKV } from './src/storage/mmkvInstance';
import { ThemeProvider } from './src/context/ThemeContext';
import { SnippetProvider } from './src/context/SnippetContext';
import { BillingProvider } from './src/context/BillingContext';
import { HomeScreen } from './src/screens/HomeScreen';

SplashScreen.preventAutoHideAsync();

type AppBootState = 'loading' | 'ready' | 'error';

export default function App() {
  const [bootState, setBootState] = useState<AppBootState>('loading');
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    async function boot() {
      try {
        // Initialize encrypted MMKV before any context provider mounts.
        // All storage reads happen after this resolves.
        await initializeMMKV();
        setBootState('ready');
      } catch (err) {
        setBootError(
          err instanceof Error ? err.message : 'Failed to initialize storage.',
        );
        setBootState('error');
      } finally {
        await SplashScreen.hideAsync();
      }
    }
    void boot();
  }, []);

  if (bootState === 'loading') {
    return null;
  }

  if (bootState === 'error') {
    return (
      <View style={styles.errorRoot}>
        <Text style={styles.errorTitle}>Initialization Failed</Text>
        <Text style={styles.errorBody}>{bootError}</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <ThemeProvider>
          <BillingProvider>
            <SnippetProvider>
              <StatusBar style="light" />
              <HomeScreen />
            </SnippetProvider>
          </BillingProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  errorRoot: {
    flex: 1,
    backgroundColor: '#1C1B1F',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  errorTitle: {
    color: '#F2B8B5',
    fontSize: 20,
    fontWeight: '700',
  },
  errorBody: {
    color: '#CAC4D0',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});
