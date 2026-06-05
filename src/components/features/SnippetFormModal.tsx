import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Snippet, SnippetFormData } from '../../types';
import {
  MAX_CATEGORY_LENGTH,
  MAX_CONTENT_LENGTH,
  MAX_TITLE_LENGTH,
  SNIPPET_ACCENT_COLORS,
  SNIPPET_CATEGORIES,
} from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { AppTextInput } from '../common/AppTextInput';
import { RippleButton } from '../common/RippleButton';
import { ColorPicker } from '../common/ColorPicker';
import { validateSnippetForm, type ValidationResult } from '../../utils/validation';
import { SurfaceLevel2, SurfaceLevel3 } from '../../utils/theme';

interface SnippetFormModalProps {
  visible: boolean;
  editTarget: Snippet | null;
  onSubmit: (form: SnippetFormData) => void;
  onCancel: () => void;
}

const EMPTY_FORM: SnippetFormData = {
  title: '',
  content: '',
  color: SNIPPET_ACCENT_COLORS[0],
  category: 'General',
};

export function SnippetFormModal({
  visible,
  editTarget,
  onSubmit,
  onCancel,
}: SnippetFormModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<SnippetFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<ValidationResult['errors']>({});
  const contentRef = useRef<import('react-native').TextInput>(null);

  useEffect(() => {
    if (visible) {
      if (editTarget) {
        setForm({
          title: editTarget.title,
          content: editTarget.content,
          color: editTarget.color,
          category: editTarget.category,
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
    }
  }, [visible, editTarget]);

  const handleSubmit = useCallback(() => {
    const result = validateSnippetForm(form);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onSubmit(form);
  }, [form, onSubmit]);

  const setField = useCallback(
    <K extends keyof SnippetFormData>(key: K, value: SnippetFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      if (errors[key]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
    },
    [errors],
  );

  const isEditing = editTarget !== null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={[styles.root, { backgroundColor: SurfaceLevel2 }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.outlineVariant, paddingTop: Math.max(insets.top, 32) + 16 }]}>
          <Pressable
            onPress={onCancel}
            android_ripple={{ color: `${colors.primary}40`, borderless: true }}
            hitSlop={16}
            style={styles.headerButton}
          >
            <Text style={[styles.headerButtonText, { color: colors.onSurfaceVariant }]}>
              Cancel
            </Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>
            {isEditing ? 'Edit Snippet' : 'New Snippet'}
          </Text>
          <Pressable
            onPress={handleSubmit}
            android_ripple={{ color: `${colors.primary}40`, borderless: true }}
            hitSlop={16}
            style={styles.headerButton}
          >
            <Text style={[styles.headerButtonText, { color: colors.primary, fontWeight: '700' }]}>
              {isEditing ? 'Save' : 'Create'}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <AppTextInput
            label="Title"
            value={form.title}
            onChangeText={(v) => setField('title', v)}
            maxLength={MAX_TITLE_LENGTH}
            error={errors.title}
            placeholder="e.g. My Email Signature"
            returnKeyType="next"
            onSubmitEditing={() => contentRef.current?.focus()}
            autoFocus={!isEditing}
          />

          {/* Content */}
          <AppTextInput
            ref={contentRef}
            label="Content"
            value={form.content}
            onChangeText={(v) => setField('content', v)}
            maxLength={MAX_CONTENT_LENGTH}
            error={errors.content}
            placeholder="Paste or type the text you want to copy repeatedly..."
            multiline
            numberOfLines={6}
            style={styles.contentInput}
            returnKeyType="default"
          />

          {/* Color */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}>
              Accent Colour
            </Text>
            <ColorPicker
              selected={form.color}
              onSelect={(c) => setField('color', c)}
            />
            {errors.color && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.color}
              </Text>
            )}
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}>
              Category
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}
            >
              {SNIPPET_CATEGORIES.map((cat) => {
                const active = form.category === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setField('category', cat)}
                    android_ripple={{
                      color: `${form.color}40`,
                      borderless: false,
                    }}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: active
                          ? `${form.color}30`
                          : SurfaceLevel3,
                        borderColor: active ? form.color : colors.outlineVariant,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        { color: active ? form.color : colors.onSurfaceVariant },
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Custom category input */}
            <AppTextInput
              label="Custom category (optional)"
              value={form.category}
              onChangeText={(v) => setField('category', v)}
              maxLength={MAX_CATEGORY_LENGTH}
              error={errors.category}
              placeholder="Or type a custom category"
            />
          </View>

          {/* Preview */}
          {form.title.trim().length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}>
                Preview
              </Text>
              <View
                style={[
                  styles.preview,
                  {
                    backgroundColor: `${form.color}15`,
                    borderLeftColor: form.color,
                  },
                ]}
              >
                <Text style={[styles.previewTitle, { color: colors.onSurface }]}>
                  {form.title || 'Untitled'}
                </Text>
                <Text
                  style={[styles.previewContent, { color: colors.onSurfaceVariant }]}
                  numberOfLines={3}
                >
                  {form.content || '(empty)'}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16, // overridden inline with safe area inset
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.15,
  },
  headerButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
    paddingBottom: 48,
  },
  contentInput: {
    minHeight: 120,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    marginTop: 2,
  },
  preview: {
    borderLeftWidth: 4,
    borderRadius: 4,
    padding: 12,
    gap: 6,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  previewContent: {
    fontSize: 13,
    lineHeight: 18,
  },
});
