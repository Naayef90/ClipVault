/**
 * Android home-screen widget — "Copied Items"
 *
 * Shows the 5 most recently created snippets.
 * Tapping any row triggers a broadcastIntent that the main app handles
 * to copy the snippet content to the clipboard.
 *
 * Built with react-native-android-widget.
 * After adding the library run:
 *   npx expo prebuild --platform android --clean
 */
import React from 'react';
import {
  FlexWidget,
  TextWidget,
  ListWidget,
  ImageWidget,
} from 'react-native-android-widget';
import type { Snippet } from '../types';

interface SnippetWidgetProps {
  snippets: Snippet[];
}

const CATEGORY_ICONS: Record<string, string> = {
  Work: '💼', Personal: '👤', Finance: '💳',
  Medical: '🏥', Legal: '⚖️', Travel: '✈️',
  Tech: '💻', General: '📌',
};

function WidgetRow({ snippet }: { snippet: Snippet }) {
  return (
    <FlexWidget
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#1E1E2E',
        marginBottom: 4,
        width: 'match_parent',
      }}
      clickAction="COPY_SNIPPET"
      clickActionData={{ snippetId: snippet.id, content: snippet.content }}
    >
      {/* Colour dot */}
      <FlexWidget
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: snippet.color,
          marginRight: 10,
        }}
      />

      {/* Title + preview */}
      <FlexWidget style={{ flex: 1, flexDirection: 'column', gap: 2 }}>
        <TextWidget
          text={snippet.title}
          style={{ fontSize: 14, fontWeight: '600', color: '#E6E1E5' }}
          maxLines={1}
        />
        <TextWidget
          text={snippet.content}
          style={{ fontSize: 12, color: '#938F99' }}
          maxLines={1}
        />
      </FlexWidget>

      {/* Copy icon */}
      <TextWidget
        text="📋"
        style={{ fontSize: 16, marginLeft: 8 }}
      />
    </FlexWidget>
  );
}

export function SnippetWidget({ snippets }: SnippetWidgetProps) {
  const recent = snippets
    .slice()
    .sort((a, b) => b.dateCreated - a.dateCreated)
    .slice(0, 5);

  return (
    <FlexWidget
      style={{
        flexDirection: 'column',
        backgroundColor: '#13121A',
        borderRadius: 16,
        padding: 12,
        width: 'match_parent',
        height: 'match_parent',
      }}
    >
      {/* Header */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 8,
          gap: 6,
        }}
      >
        <TextWidget
          text="📋"
          style={{ fontSize: 16 }}
        />
        <TextWidget
          text="Copied Items"
          style={{
            fontSize: 14,
            fontWeight: '700',
            color: '#D0BCFF',
          }}
        />
      </FlexWidget>

      {/* Snippet rows */}
      {recent.length === 0 ? (
        <TextWidget
          text="No snippets yet. Open the app to add some."
          style={{ fontSize: 12, color: '#938F99', textAlign: 'center' }}
        />
      ) : (
        <ListWidget style={{ width: 'match_parent' }}>
          {recent.map((s) => (
            <WidgetRow key={s.id} snippet={s} />
          ))}
        </ListWidget>
      )}

      {/* Footer — tap to open app */}
      <FlexWidget
        style={{ marginTop: 6, alignItems: 'flex-end' }}
        clickAction="OPEN_APP"
      >
        <TextWidget
          text="Open app ›"
          style={{ fontSize: 11, color: '#49454F' }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
