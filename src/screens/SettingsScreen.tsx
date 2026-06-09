import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Alert,
  Animated,
  BackHandler,
  Dimensions,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useInAppBilling } from '../hooks/useInAppBilling';
import { useSnippets } from '../context/SnippetContext';
import { useSnackbar } from '../hooks/useSnackbar';
import { SnackbarHost } from '../components/common/SnackbarHost';
import { SnippetStorage } from '../storage/SnippetStorage';
import * as Clipboard from 'expo-clipboard';
import { SurfaceLevel1, SurfaceLevel2, SurfaceLevel3 } from '../utils/theme';
import { PrivacyPolicyScreen } from './PrivacyPolicyScreen';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface SettingsScreenProps {
  visible: boolean;
  onClose: () => void;
}

interface SettingsRowProps {
  icon: string;
  label: string;
  sublabel?: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

function SettingsRow({ icon, label, sublabel, value, onPress, destructive, disabled }: SettingsRowProps) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || !onPress}
      activeOpacity={0.6}
      style={[styles.row, { opacity: disabled ? 0.4 : 1 }]}
    >
      <Text style={styles.rowIcon}>{icon}</Text>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: destructive ? colors.error : colors.onSurface }]}>
          {label}
        </Text>
        {sublabel ? (
          <Text style={[styles.rowSublabel, { color: colors.onSurfaceVariant }]}>{sublabel}</Text>
        ) : null}
      </View>
      {value ? (
        <Text style={[styles.rowValue, { color: colors.onSurfaceVariant }]}>{value}</Text>
      ) : onPress ? (
        <Text style={[styles.rowChevron, { color: colors.outlineVariant }]}>›</Text>
      ) : null}
    </TouchableOpacity>
  );
}

function SectionHeader({ title, colors }: { title: string; colors: { onSurfaceVariant: string } }) {
  return (
    <Text style={[styles.sectionHeader, { color: colors.onSurfaceVariant }]}>
      {title}
    </Text>
  );
}

function Divider({ colors }: { colors: { outlineVariant: string } }) {
  return <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />;
}

export function SettingsScreen({ visible, onClose }: SettingsScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { isAdsRemoved, purchaseAdsRemoval } = useInAppBilling();
  const { snippets, deleteSnippet } = useSnippets();
  const { current: snackbar, showSnackbar, dismissSnackbar } = useSnackbar();
  const [loading, setLoading] = useState<string | null>(null);
  const [privacyVisible, setPrivacyVisible] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (privacyVisible) { setPrivacyVisible(false); return true; }
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, privacyVisible, onClose]);

  // Slide-up animation
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 0,
          speed: 14,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleRemoveAds = useCallback(async () => {
    setLoading('ads');
    try {
      await purchaseAdsRemoval();
      await showSnackbar('Ads removed. Thank you! ❤️', 'success');
    } catch {
      await showSnackbar('Purchases not available yet. Coming soon!', 'info');
    } finally {
      setLoading(null);
    }
  }, [purchaseAdsRemoval, showSnackbar]);

  const handleExport = useCallback(async () => {
    const all = SnippetStorage.getAll();
    const json = JSON.stringify(all, null, 2);
    await Clipboard.setStringAsync(json);
    await showSnackbar(`${all.length} snippets copied as JSON`, 'success');
  }, [showSnackbar]);

  const handleClearAll = useCallback(() => {
    if (snippets.length === 0) {
      void showSnackbar('No snippets to delete.', 'info');
      return;
    }
    Alert.alert(
      'Clear All Snippets',
      `This will permanently delete all ${snippets.length} snippets. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => {
            snippets.forEach(s => deleteSnippet(s.id));
            void showSnackbar('All snippets deleted.', 'info');
          },
        },
      ],
    );
  }, [snippets, deleteSnippet, showSnackbar]);

  const [everShown, setEverShown] = React.useState(false);
  React.useEffect(() => { if (visible) setEverShown(true); }, [visible]);
  if (!visible && !everShown) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      {/* Backdrop */}
      <Animated.View
        style={[styles.backdrop, { opacity: backdropAnim }]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: SurfaceLevel2 },
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View style={[styles.header, {
          borderBottomColor: colors.outlineVariant,
          paddingTop: Math.max(insets.top, 32) + 8,
        }]}>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Settings</Text>
          <Pressable onPress={onClose} hitSlop={16} style={styles.closeBtn}>
            <Text style={[styles.closeText, { color: colors.onSurfaceVariant }]}>✕</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Monetization ─────────────────────────────────────────── */}
          <SectionHeader title="MONETIZATION" colors={colors} />
          <View style={[styles.card, { backgroundColor: SurfaceLevel3 }]}>
            {isAdsRemoved ? (
              <SettingsRow
                icon="⭐"
                label="Ads Removed"
                sublabel="You're enjoying an ad-free experience"
                value="Active"
                disabled
              />
            ) : (
              <SettingsRow
                icon="⚡"
                label="Remove Ads"
                sublabel="One-time purchase for lifetime ad-free"
                onPress={loading === 'ads' ? undefined : handleRemoveAds}
                disabled={loading === 'ads'}
              />
            )}
          </View>

          {/* ── Widget ───────────────────────────────────────────────── */}
          <SectionHeader title="HOME SCREEN WIDGET" colors={colors} />
          <View style={[styles.card, { backgroundColor: SurfaceLevel3 }]}>
            <View style={[styles.widgetInfo, { backgroundColor: `${colors.primary}08`, borderColor: colors.outlineVariant }]}>
              <Text style={[styles.widgetInfoTitle, { color: colors.onSurface }]}>
                2 widget sizes available
              </Text>
              <Text style={[styles.widgetInfoBody, { color: colors.onSurfaceVariant }]}>
                Long-press any empty area on your home screen → tap{' '}
                <Text style={{ fontWeight: '700', color: colors.onSurface }}>"Widgets"</Text>
                {' '}→ search for{' '}
                <Text style={{ fontWeight: '700', color: colors.onSurface }}>"Clipboard Snippets"</Text>
              </Text>
              <View style={styles.widgetSizes}>
                {[
                  { name: 'Slim',     cells: '3×1', desc: 'Scrollable', emoji: '▬' },
                  { name: 'Standard', cells: '3×2', desc: 'Scrollable', emoji: '▭' },
                ].map(size => (
                  <View key={size.name} style={[styles.sizeChip, { backgroundColor: SurfaceLevel1, borderColor: colors.outlineVariant }]}>
                    <Text style={{ fontSize: 18 }}>{size.emoji}</Text>
                    <Text style={[styles.sizeName,  { color: colors.onSurface }]}>{size.name}</Text>
                    <Text style={[styles.sizeCells, { color: colors.onSurfaceVariant }]}>{size.cells}</Text>
                    <Text style={[styles.sizeCount, { color: colors.onSurfaceVariant }]}>{size.desc}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* ── Data ─────────────────────────────────────────────────── */}
          <SectionHeader title="DATA MANAGEMENT" colors={colors} />
          <View style={[styles.card, { backgroundColor: SurfaceLevel3 }]}>
            <SettingsRow icon="📊" label="Snippets Stored" value={`${snippets.length}`} disabled />
            <Divider colors={colors} />
            <SettingsRow
              icon="📤"
              label="Export All Snippets"
              sublabel="Copies all snippets as JSON to clipboard"
              onPress={handleExport}
            />
            <Divider colors={colors} />
            <SettingsRow
              icon="🗑️"
              label="Clear All Snippets"
              sublabel="Permanently delete every snippet"
              onPress={handleClearAll}
              destructive
            />
          </View>

          {/* ── About ────────────────────────────────────────────────── */}
          <SectionHeader title="ABOUT" colors={colors} />
          <View style={[styles.card, { backgroundColor: SurfaceLevel3 }]}>
            <SettingsRow icon="📱" label="App Name" value="ClipVault" disabled />
            <Divider colors={colors} />
            <SettingsRow icon="🏷️" label="Version" value="1.0.0" disabled />
            <Divider colors={colors} />
            <SettingsRow
              icon="🔒"
              label="Privacy Policy"
              sublabel="How we handle your data"
              onPress={() => setPrivacyVisible(true)}
            />
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        <SnackbarHost current={snackbar} onDismiss={dismissSnackbar} bottomOffset={24} />
      </Animated.View>

      <PrivacyPolicyScreen
        visible={privacyVisible}
        onClose={() => setPrivacyVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    elevation: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', letterSpacing: 0.15 },
  closeBtn: { padding: 8, borderRadius: 100 },
  closeText: { fontSize: 18, fontWeight: '600' },
  scrollView: { flex: 1 },
  scroll: { padding: 16, gap: 6, paddingTop: 8 },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 6,
    marginLeft: 4,
  },
  card: { borderRadius: 14, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
    minHeight: 56,
  },
  rowIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 15, fontWeight: '500' },
  rowSublabel: { fontSize: 12, lineHeight: 17 },
  rowValue: { fontSize: 13, fontWeight: '500' },
  rowChevron: { fontSize: 20, fontWeight: '300' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 58 },
  widgetInfo: { margin: 12, borderRadius: 10, borderWidth: 1, padding: 14, gap: 10 },
  widgetInfoTitle: { fontSize: 14, fontWeight: '700' },
  widgetInfoBody: { fontSize: 13, lineHeight: 19 },
  widgetSizes: { flexDirection: 'row', gap: 8, marginTop: 4 },
  sizeChip: { flex: 1, alignItems: 'center', borderRadius: 10, borderWidth: 1, paddingVertical: 10, gap: 3 },
  sizeName:  { fontSize: 12, fontWeight: '700' },
  sizeCells: { fontSize: 10 },
  sizeCount: { fontSize: 10, fontWeight: '600' },
});
