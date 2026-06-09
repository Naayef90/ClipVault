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
  expanded: boolean;
  onExpand: (id: string | null) => void;
  onCopy: (snippet: Snippet) => void;
  onEdit: (snippet: Snippet) => void;
  onDelete: (snippet: Snippet) => void;
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
  expanded,
  onExpand,
  onCopy,
  onEdit,
  onDelete,
}: SnippetCardProps) {
  const { colors } = useTheme();

  const handlePress  = useCallback(() => onExpand(expanded ? null : snippet.id), [expanded, onExpand, snippet.id]);
  const handleCopy   = useCallback(() => onCopy(snippet),   [onCopy,   snippet]);
  const handleEdit   = useCallback(() => onEdit(snippet),   [onEdit,   snippet]);
  const handleDelete = useCallback(() => onDelete(snippet), [onDelete, snippet]);

  const icon = CATEGORY_ICONS[snippet.category] ?? '📌';

  return (
    <Pressable
      onPress={handlePress}
      android_ripple={{ color: `${snippet.color}20` }}
      style={[
        styles.card,
        {
          borderColor: expanded ? `${snippet.color}55` : colors.outlineVariant,
          backgroundColor: SurfaceLevel1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={snippet.title}
      accessibilityState={{ expanded }}
    >
      {/* ── Header row ── */}
      <View style={styles.header}>
        <View style={[styles.accentBar, { backgroundColor: snippet.color }]} />

        <View style={styles.iconWrap}>
          <Text style={styles.icon}>{icon}</Text>
        </View>

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

        <TouchableOpacity
          onPress={handleCopy}
          activeOpacity={0.7}
          style={[styles.copyBtn, { borderColor: snippet.color }]}
          accessibilityLabel="Copy"
          hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
        >
          <Text style={styles.btnIcon}>📋</Text>
          <Text style={[styles.btnLabel, { color: snippet.color }]}>Copy</Text>
        </TouchableOpacity>

        <Text style={[styles.chevron, { color: colors.onSurfaceVariant }]}>
          {expanded ? '▲' : '▼'}
        </Text>
      </View>

      {/* ── Expanded section ── */}
      {expanded && (
        <>
          {/* Full content preview */}
          <View style={[styles.contentBox, { backgroundColor: `${snippet.color}0D`, borderTopColor: `${snippet.color}33` }]}>
            <Text style={[styles.contentText, { color: colors.onSurface }]}>
              {snippet.content}
            </Text>
          </View>

          {/* Action bar */}
          <View style={[styles.actionBar, { borderTopColor: colors.outlineVariant }]}>
            <TouchableOpacity
              onPress={handleEdit}
              activeOpacity={0.7}
              style={styles.actionBtn}
              accessibilityLabel="Edit"
            >
              <Text style={styles.actionIcon}>✏️</Text>
              <Text style={[styles.actionLabel, { color: colors.primary }]}>Edit</Text>
            </TouchableOpacity>

            <View style={[styles.actionDivider, { backgroundColor: colors.outlineVariant }]} />

            <TouchableOpacity
              onPress={handleDelete}
              activeOpacity={0.7}
              style={styles.actionBtn}
              accessibilityLabel="Delete"
            >
              <Text style={styles.actionIcon}>🗑️</Text>
              <Text style={[styles.actionLabel, { color: colors.error }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 4,
    overflow: 'hidden',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 62,
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
  icon: { fontSize: 19 },

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

  copyBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    flexShrink: 0,
  },
  btnIcon: { fontSize: 13 },
  btnLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },

  chevron: {
    fontSize: 9,
    fontWeight: '700',
    paddingHorizontal: 10,
    flexShrink: 0,
  },

  contentBox: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  contentText: {
    fontSize: 13,
    lineHeight: 20,
  },

  actionBar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    gap: 3,
  },
  actionDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
  actionIcon: { fontSize: 14 },
  actionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
