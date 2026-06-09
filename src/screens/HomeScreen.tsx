import React, { useCallback, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Snippet, SnippetFormData } from '../types';
import { useSnippets } from '../context/SnippetContext';
import { useTheme } from '../context/ThemeContext';
import { useInAppBilling } from '../hooks/useInAppBilling';
import { useClipboardManager } from '../hooks/useClipboardManager';
import { useSnackbar } from '../hooks/useSnackbar';
import { SnippetGrid } from '../components/features/SnippetGrid';
import { SnippetFormModal } from '../components/features/SnippetFormModal';
import { BannerAdContainer } from '../components/features/BannerAdContainer';
import { SnackbarHost } from '../components/common/SnackbarHost';
import AdScheduler from '../services/AdScheduler';
import { SettingsScreen } from './SettingsScreen';
import { SurfaceLevel1 } from '../utils/theme';

export function HomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { snippets, isLoading, addSnippet, updateSnippet, deleteSnippet } = useSnippets();
  const { isAdsRemoved, purchaseAdsRemoval } = useInAppBilling();
  const { copyToClipboard } = useClipboardManager();
  const { current: snackbar, showSnackbar, dismissSnackbar } = useSnackbar();

  const [formVisible,     setFormVisible]     = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [editTarget,      setEditTarget]      = useState<Snippet | null>(null);
  const [search,          setSearch]          = useState('');

  const filtered = search.trim()
    ? snippets.filter(
        s =>
          s.title.toLowerCase().includes(search.toLowerCase()) ||
          s.content.toLowerCase().includes(search.toLowerCase()),
      )
    : snippets;

  const handleCopy = useCallback(async (snippet: Snippet) => {
    const result = await copyToClipboard(snippet.content);
    await showSnackbar(
      result.success ? `"${snippet.title}" copied` : result.error ?? 'Copy failed.',
      result.success ? 'success' : 'error',
    );
  }, [copyToClipboard, showSnackbar]);

  const handleDelete = useCallback((snippet: Snippet) => {
    Alert.alert('Delete Snippet', `Delete "${snippet.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          deleteSnippet(snippet.id);
          await showSnackbar('Snippet deleted.', 'info');
        },
      },
    ]);
  }, [deleteSnippet, showSnackbar]);

  const handleEdit = useCallback((snippet: Snippet) => {
    setEditTarget(snippet);
    setFormVisible(true);
  }, []);

  const handleFormSubmit = useCallback(async (form: SnippetFormData) => {
    setFormVisible(false);
    if (editTarget) {
      updateSnippet(editTarget.id, form);
      await showSnackbar('Snippet updated.', 'success');
    } else {
      await addSnippet(form);
      await showSnackbar('Snippet created.', 'success');
    }
    AdScheduler.getInstance().onWriteCommit();
  }, [editTarget, addSnippet, updateSnippet, showSnackbar]);

  const handleRemoveAds = useCallback(() => {
    Alert.alert('Remove Ads', 'Purchase lifetime ad-free experience?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Purchase',
        onPress: async () => {
          try {
            await purchaseAdsRemoval();
            await showSnackbar('Ads removed. Thank you!', 'success');
          } catch {
            await showSnackbar('Purchases not available yet. Coming soon!', 'info');
          }
        },
      },
    ]);
  }, [purchaseAdsRemoval, showSnackbar]);

  // Safe top padding — accounts for status bar on all Android devices
  const topPad = Platform.OS === 'android'
    ? (StatusBar.currentHeight ?? insets.top ?? 24)
    : insets.top;

  const fabBottom = 74;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Solid status bar — same colour as background so it blends in */}
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background}
        translucent={false}
      />

      {/* Manual top inset — replaces SafeAreaView which misbehaves on Android */}
      <View style={{ height: topPad, backgroundColor: colors.background }} />

      {/* ── App Bar ─────────────────────────────────────────────────── */}
      <View style={[styles.appBar, { borderBottomColor: colors.outlineVariant }]}>
        <View>
          <Text style={[styles.appTitle, { color: colors.onSurface }]}>ClipVault</Text>
          <Text style={[styles.appSub, { color: colors.onSurfaceVariant }]}>
            {snippets.length} snippet{snippets.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.appBarRight}>
          {!isAdsRemoved && (
            <Pressable
              onPress={handleRemoveAds}
              hitSlop={12}
              style={[styles.iconBtn, { backgroundColor: `${colors.primary}10` }]}
              android_ripple={{ color: `${colors.primary}30`, borderless: true }}
            >
              <Text style={styles.iconBtnText}>⚡</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => setSettingsVisible(true)}
            hitSlop={12}
            style={[styles.iconBtn, { backgroundColor: `${colors.primary}10` }]}
            android_ripple={{ color: `${colors.primary}30`, borderless: true }}
            accessibilityLabel="Settings"
          >
            <Text style={styles.iconBtnText}>⚙️</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Search ──────────────────────────────────────────────────── */}
      <View style={[styles.searchWrap, {
        backgroundColor: SurfaceLevel1,
        borderColor: colors.outlineVariant,
      }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.onSurface }]}
          placeholder="Search snippets…"
          placeholderTextColor={colors.onSurfaceVariant}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          cursorColor={colors.primary}
          selectionColor={`${colors.primary}50`}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={10}>
            <Text style={{ color: colors.onSurfaceVariant, fontSize: 16 }}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* ── Snippet list ────────────────────────────────────────────── */}
      <View style={styles.listCard}>
        <SnippetGrid
          snippets={filtered}
          isLoading={isLoading}
          onCopy={handleCopy}
          onEdit={handleEdit}
          onDelete={handleDelete}
          ListFooterComponent={<View style={{ height: 80 }} />}
        />
      </View>

      {/* ── Bottom Banner Ad ────────────────────────────────────────── */}
      <View style={[styles.bottomBanner, { backgroundColor: colors.background }]}>
        <BannerAdContainer />
      </View>

      {/* ── FAB ─────────────────────────────────────────────────────── */}
      <Pressable
        onPress={() => { setEditTarget(null); setFormVisible(true); }}
        android_ripple={{ color: 'rgba(0,0,0,0.3)', borderless: false }}
        style={[styles.fab, { backgroundColor: colors.primary, bottom: fabBottom }]}
        accessibilityLabel="Add new snippet"
        accessibilityRole="button"
      >
        <Text style={[styles.fabIcon, { color: colors.onPrimary }]}>＋</Text>
      </Pressable>

      {/* ── Overlays ────────────────────────────────────────────────── */}
      <SnippetFormModal
        visible={formVisible}
        editTarget={editTarget}
        onSubmit={handleFormSubmit}
        onCancel={() => setFormVisible(false)}
      />
      <SettingsScreen
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
      <SnackbarHost
        current={snackbar}
        onDismiss={dismissSnackbar}
        bottomOffset={isAdsRemoved ? 80 : 134}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  appTitle: { fontSize: 20, fontWeight: '700', letterSpacing: 0.2 },
  appSub:   { fontSize: 12, marginTop: 1 },

  appBarRight:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn:      { padding: 8, borderRadius: 100 },
  iconBtnText:  { fontSize: 18 },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  searchIcon:  { fontSize: 14 },
  searchInput: { flex: 1, fontSize: 15, padding: 0, margin: 0 },

  listCard: {
    flex: 1,
    marginBottom: 8,
  },

  bottomBanner: {
    alignItems: 'center',
    paddingTop: 4,
  },

  fab: {
    position: 'absolute',
    right: 18,
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    overflow: 'hidden',
  },
  fabIcon: { fontSize: 26, fontWeight: '300', lineHeight: 30 },
});
