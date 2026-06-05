/**
 * Background task handler for the Android home-screen widget.
 *
 * react-native-android-widget calls this file in a headless JS context
 * (no UI) whenever the OS requests a widget update or the user taps a row.
 *
 * Registration:
 *   import './src/widget/widgetTaskHandler'; ← add to index.js
 */
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import * as Clipboard from 'expo-clipboard';
import { AppState } from 'react-native';
import { getMMKV } from '../storage/mmkvInstance';
import { parseSnippetArray } from '../utils/validation';
import { getOrCreateEncryptionKey } from '../utils/security';
import { MMKV } from 'react-native-mmkv';

const SNIPPETS_KEY = 'user_snippets_v1';

async function ensureStorage(): Promise<MMKV> {
  const key = await getOrCreateEncryptionKey();
  return new MMKV({ id: 'clipboard_snippets_db', encryptionKey: key });
}

registerWidgetTaskHandler(async (event) => {
  if (event.widgetAction === 'COPY_SNIPPET') {
    const data = event.clickActionData as { content?: string } | undefined;
    const content = data?.content;

    if (!content) return;

    /**
     * Widget taps run in a headless context where AppState.currentState
     * may be 'background'. We intentionally allow the copy here because
     * the user explicitly requested it by tapping the widget row, which
     * is a deliberate foreground-equivalent gesture.
     */
    await Clipboard.setStringAsync(content);
    return;
  }

  if (event.widgetAction === 'WIDGET_ADDED' || event.widgetAction === 'WIDGET_UPDATE') {
    /**
     * Rebuild the widget UI with the latest snippet data.
     * Called periodically by the OS and whenever the user adds the widget.
     */
    const { updateWidget } = await import('react-native-android-widget');
    const { SnippetWidget } = await import('./SnippetWidget');

    const storage = await ensureStorage();
    const raw = storage.getString(SNIPPETS_KEY);
    const snippets = parseSnippetArray(raw);

    await updateWidget({
      widgetName: 'SnippetWidget',
      renderWidget: () => SnippetWidget({ snippets }),
    });
  }
});
