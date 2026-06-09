import { registerWidgetTaskHandler, requestWidgetUpdate } from 'react-native-android-widget';
import * as Clipboard from 'expo-clipboard';
import { MMKV } from 'react-native-mmkv';
import { parseSnippetArray } from '../utils/validation';
import { SnippetWidget } from './SnippetWidget';

const WIDGET_SNIPPETS_KEY = 'widget_snippets_v1';

function loadSnippets() {
  try {
    const storage = new MMKV({ id: 'widget_cache_db' });
    const raw = storage.getString(WIDGET_SNIPPETS_KEY);
    return parseSnippetArray(raw);
  } catch {
    return [];
  }
}

async function refreshWidget() {
  const snippets = loadSnippets();
  await Promise.all([
    requestWidgetUpdate({
      widgetName: 'SnippetWidget',
      renderWidget: () => SnippetWidget({ snippets }),
    }),
    requestWidgetUpdate({
      widgetName: 'SlimSnippetWidget',
      renderWidget: () => SnippetWidget({ snippets }),
    }),
  ]);
}

registerWidgetTaskHandler(async (event) => {
  if (event.widgetAction === 'WIDGET_CLICK' && event.clickAction === 'COPY_SNIPPET') {
    const data = event.clickActionData as { content?: string } | undefined;
    if (data?.content) await Clipboard.setStringAsync(data.content);
    return;
  }

  if (
    event.widgetAction === 'WIDGET_ADDED' ||
    event.widgetAction === 'WIDGET_UPDATE' ||
    event.widgetAction === 'WIDGET_RESIZED'
  ) {
    await refreshWidget();
  }
});
