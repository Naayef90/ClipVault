import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';
import type { Snippet } from '../../types';
import { SnippetCard } from './SnippetCard';
import { useTheme } from '../../context/ThemeContext';

interface SnippetGridProps {
  snippets: Snippet[];
  isLoading: boolean;
  onCopy: (snippet: Snippet) => void;
  onDelete: (snippet: Snippet) => void;
  onLongPress: (snippet: Snippet) => void;
  ListHeaderComponent?: React.ReactElement;
  ListFooterComponent?: React.ReactElement;
}

function EmptyState({ colors }: { colors: { onSurfaceVariant: string; primary: string } }) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📋</Text>
      <Text style={[styles.emptyTitle, { color: colors.primary }]}>No snippets yet</Text>
      <Text style={[styles.emptyBody, { color: colors.onSurfaceVariant }]}>
        Tap the + button to add your first reusable text block.
      </Text>
    </View>
  );
}

export function SnippetGrid({
  snippets,
  isLoading,
  onCopy,
  onDelete,
  onLongPress,
  ListHeaderComponent,
  ListFooterComponent,
}: SnippetGridProps) {
  const { colors } = useTheme();

  const renderItem = useCallback<ListRenderItem<Snippet>>(
    ({ item }) => (
      <SnippetCard
        snippet={item}
        onCopy={onCopy}
        onDelete={onDelete}
        onLongPress={onLongPress}
      />
    ),
    [onCopy, onDelete, onLongPress],
  );

  const keyExtractor = useCallback((item: Snippet) => item.id, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={snippets}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={1}
      contentContainerStyle={[
        styles.listContent,
        snippets.length === 0 && styles.listContentEmpty,
      ]}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={<EmptyState colors={colors} />}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews
      maxToRenderPerBatch={12}
      windowSize={7}
      initialNumToRender={12}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 80,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 64,
    gap: 12,
  },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontSize: 20, fontWeight: '600' },
  emptyBody: { fontSize: 14, lineHeight: 22, textAlign: 'center' },
});
