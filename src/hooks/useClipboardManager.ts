import { useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

interface ClipboardResult {
  success: boolean;
  error?: string;
}

/**
 * Clipboard manager that:
 * 1. Guards all write operations behind an AppState.currentState === 'active'
 *    check to block background extraction vectors.
 * 2. Scrubs the local content reference immediately after handing it to the
 *    native clipboard module so GC can collect the string.
 * 3. Fires light haptic feedback on each successful copy.
 */
export function useClipboardManager() {
  const pendingRef = useRef<string | null>(null);

  const copyToClipboard = useCallback(
    async (content: string): Promise<ClipboardResult> => {
      if (AppState.currentState !== 'active') {
        return { success: false, error: 'App is not in the foreground.' };
      }

      pendingRef.current = content;

      try {
        await Clipboard.setStringAsync(pendingRef.current);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Clipboard write failed.',
        };
      } finally {
        // Scrub from local scope immediately — removes the binding so GC can
        // reclaim the memory without waiting for hook teardown.
        pendingRef.current = null;
      }
    },
    [],
  );

  return { copyToClipboard };
}
