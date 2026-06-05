import { NativeModules, Platform } from 'react-native';
import type { Snippet } from '../types';

const { WidgetUpdate } = NativeModules;

/**
 * Pushes the 5 most-recent snippets to the Android home-screen widget.
 * Silently no-ops on iOS or if the native module is unavailable
 * (e.g. running in Expo Go).
 */
export async function syncWidgetData(snippets: Snippet[]): Promise<void> {
  if (Platform.OS !== 'android' || !WidgetUpdate?.updateSnippets) return;

  try {
    const recent = snippets
      .slice()
      .sort((a, b) => b.dateCreated - a.dateCreated)
      .map(({ id, title, content, color, category }) => ({
        id,
        title,
        content,
        color,
        category,
      }));

    await WidgetUpdate.updateSnippets(JSON.stringify(recent));
  } catch {
    // Widget sync is non-critical — never crash the app if it fails
  }
}
