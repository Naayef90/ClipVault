import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import type { Snippet } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { SurfaceLevel3 } from '../../utils/theme';

interface BottomSheetActionsProps {
  snippet: Snippet | null;
  visible: boolean;
  onEdit: (snippet: Snippet) => void;
  onDelete: (snippet: Snippet) => void;
  onClose: () => void;
}

interface ActionRowProps {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
  destructive?: boolean;
}

function ActionRow({ icon, label, color, onPress, destructive = false }: ActionRowProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{
        color: destructive ? `${colors.error}30` : `${colors.primary}25`,
      }}
      style={styles.actionRow}
      accessibilityRole="button"
    >
      <Text style={[styles.actionIcon, { color: destructive ? colors.error : color }]}>
        {icon}
      </Text>
      <Text
        style={[
          styles.actionLabel,
          { color: destructive ? colors.error : colors.onSurface },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function BottomSheetActions({
  snippet,
  visible,
  onEdit,
  onDelete,
  onClose,
}: BottomSheetActionsProps) {
  const { colors } = useTheme();
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['32%'], []);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [visible]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
        onPress={onClose}
      />
    ),
    [onClose],
  );

  const handleEdit = useCallback(() => {
    if (snippet) {
      onClose();
      setTimeout(() => onEdit(snippet), 120);
    }
  }, [snippet, onEdit, onClose]);

  const handleDelete = useCallback(() => {
    if (snippet) {
      onDelete(snippet);
      onClose();
    }
  }, [snippet, onDelete, onClose]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={[styles.sheetBackground, { backgroundColor: SurfaceLevel3 }]}
      handleIndicatorStyle={{ backgroundColor: colors.outlineVariant }}
    >
      <BottomSheetView style={styles.content}>
        {snippet && (
          <>
            <View style={styles.snippetMeta}>
              <View
                style={[styles.colorDot, { backgroundColor: snippet.color }]}
              />
              <Text
                style={[styles.snippetTitle, { color: colors.onSurface }]}
                numberOfLines={1}
              >
                {snippet.title}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />

            <ActionRow
              icon="✏️"
              label="Edit Snippet"
              color={colors.primary}
              onPress={handleEdit}
            />
            <ActionRow
              icon="🗑️"
              label="Delete Snippet"
              color={colors.error}
              onPress={handleDelete}
              destructive
            />
            <ActionRow
              icon="✕"
              label="Close"
              color={colors.onSurfaceVariant}
              onPress={onClose}
            />
          </>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 4,
    paddingBottom: 16,
  },
  snippetMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  snippetTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.15,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  actionIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
});
