import React, { useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { Snippet } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { SurfaceLevel1 } from '../../utils/theme';

interface SnippetCardProps {
  snippet: Snippet;
  onCopy: (snippet: Snippet) => void;
  onDelete: (snippet: Snippet) => void;
  onLongPress: (snippet: Snippet) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  Work: '💼',
  Personal: '👤',
  Finance: '💳',
  Medical: '🏥',
  Legal: '⚖️',
  Travel: '✈️',
  Tech: '💻',
  General: '📌',
};

export const SnippetCard = React.memo(function SnippetCard({
  snippet,
  onCopy,
  onDelete,
  onLongPress,
}: SnippetCardProps) {
  const { colors } = useTheme();

  const handleCopy   = useCallback(() => onCopy(snippet),      [onCopy,      snippet]);
  const handleDelete = useCallback(() => onDelete(snippet),    [onDelete,    snippet]);
  const handleLong   = useCallback(() => onLongPress(snippet), [onLongPress, snippet]);

  const icon = CATEGORY_ICONS[snippet.category] ?? '📌';

  return (
    <Pressable
      onLongPress={handleLong}
      android_ripple={{ color: `${snippet.color}20` }}
      style={[styles.row, { borderBottomColor: colors.outlineVariant, backgroundColor: SurfaceLevel1 }]}
      accessibilityRole="button"
      accessibilityLabel={`${snippet.title}. Long press for more options.`}
    >
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: snippet.color }]} />

      {/* Category icon */}
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      {/* Title + preview — flex:1 so it takes remaining space before buttons */}
      <View style={styles.textBlock}>
        <Text
          style={[styles.title, { color: colors.onSurface }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {snippet.title}
        </Text>
        <Text
          style={[styles.preview, { color: colors.onSurfaceVariant }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {snippet.content}
        </Text>
      </View>

      {/* Action buttons — fixed width column, always on the right */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={handleCopy}
          activeOpacity={0.7}
          style={[styles.btn, styles.copyBtn, { borderColor: snippet.color }]}
          accessibilityLabel="Copy"
          hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
        >
          <Text style={styles.btnIcon}>📋</Text>
          <Text style={[styles.btnLabel, { color: snippet.color }]}>Copy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDelete}
          activeOpacity={0.7}
          style={[styles.btn, styles.delBtn, { borderColor: colors.error }]}
          accessibilityLabel="Delete"
          hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
        >
          <Text style={styles.btnIcon}>🗑️</Text>
          <Text style={[styles.btnLabel, { color: colors.error }]}>Del</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  );
});

const BTN_W = 52;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 64,
  },

  accentBar: {
    width: 3,
    alignSelf: 'stretch',
    flexShrink: 0,
  },

  iconWrap: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: {
    fontSize: 19,
  },

  /* text block: flex:1 ensures it shrinks before buttons overflow */
  textBlock: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 8,
    gap: 3,
    overflow: 'hidden',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  preview: {
    fontSize: 12,
    lineHeight: 17,
  },

  /* button column — fixed width so they never shift */
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 10,
    flexShrink: 0,
  },

  btn: {
    width: BTN_W,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 1,
  },
  copyBtn: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  delBtn: {
    backgroundColor: 'rgba(242,184,181,0.06)',
  },
  btnIcon: {
    fontSize: 13,
  },
  btnLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
