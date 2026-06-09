import React from 'react';
import { FlexWidget, ListWidget, TextWidget } from 'react-native-android-widget';
import type { Snippet } from '../types';

interface SnippetWidgetProps {
  snippets: Snippet[];
}

function WidgetRow({ snippet }: { snippet: Snippet }) {
  return (
    <FlexWidget
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
        width: 'match_parent',
        backgroundColor: '#FFFFFF',
      }}
      clickAction="COPY_SNIPPET"
      clickActionData={{ snippetId: snippet.id, content: snippet.content }}
    >
      <FlexWidget
        style={{
          width: 3,
          height: 32,
          borderRadius: 2,
          backgroundColor: snippet.color as `#${string}`,
          marginRight: 10,
        }}
      />
      <FlexWidget style={{ flex: 1, flexDirection: 'column' }}>
        <TextWidget
          text={snippet.title}
          style={{ fontSize: 13, fontWeight: '700', color: '#1C1B1F' }}
          maxLines={1}
        />
        <TextWidget
          text={snippet.content}
          style={{ fontSize: 11, color: '#49454F' }}
          maxLines={1}
        />
      </FlexWidget>
      <TextWidget text="📋" style={{ fontSize: 14, marginLeft: 6 }} />
    </FlexWidget>
  );
}

function Divider() {
  return (
    <FlexWidget
      style={{ height: 1, backgroundColor: '#E7E0EC', width: 'match_parent' }}
    />
  );
}

export function SnippetWidget({ snippets }: SnippetWidgetProps) {
  const sorted = snippets
    .slice()
    .sort((a, b) => b.dateCreated - a.dateCreated);

  return (
    <FlexWidget
      style={{
        flexDirection: 'column',
        width: 'match_parent',
        height: 'match_parent',
        backgroundColor: '#FFFFFF',
      }}
    >
      {/* ── Header ── */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: 'match_parent',
          paddingHorizontal: 14,
          paddingTop: 10,
          paddingBottom: 8,
          backgroundColor: '#FFFFFF',
        }}
      >
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextWidget text="📋" style={{ fontSize: 13, marginRight: 6 }} />
          <TextWidget
            text="Snippets"
            style={{ fontSize: 13, fontWeight: '700', color: '#1C1B1F' }}
          />
        </FlexWidget>
        <FlexWidget clickAction="OPEN_APP">
          <TextWidget
            text="Open ›"
            style={{ fontSize: 11, fontWeight: '600', color: '#6750A4' }}
          />
        </FlexWidget>
      </FlexWidget>

      <Divider />

      {/* ── Scrollable rows ── */}
      {sorted.length === 0 ? (
        <FlexWidget
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FFFFFF',
          }}
        >
          <TextWidget
            text="No snippets yet — open the app to add some."
            style={{ fontSize: 11, color: '#79747E', textAlign: 'center' }}
          />
        </FlexWidget>
      ) : (
        <ListWidget
          style={{
            width: 'match_parent',
            height: 'match_parent',
            backgroundColor: '#FFFFFF',
          }}
        >
          {sorted.map((s, i) => (
            <FlexWidget
              key={s.id}
              style={{ flexDirection: 'column', width: 'match_parent' }}
            >
              {i > 0 && <Divider />}
              <WidgetRow snippet={s} />
            </FlexWidget>
          ))}
        </ListWidget>
      )}
    </FlexWidget>
  );
}
