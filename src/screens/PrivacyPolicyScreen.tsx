import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { SurfaceLevel2, SurfaceLevel3 } from '../utils/theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface PrivacyPolicyScreenProps {
  visible: boolean;
  onClose: () => void;
}

const SECTIONS = [
  {
    title: 'Overview',
    body: 'ClipVault ("the App") is a clipboard snippet manager that lets you save, organise, and quickly copy text on your Android device. We are committed to protecting your privacy. This policy explains what data the App collects, how it is used, and your rights.',
  },
  {
    title: 'Data We Collect',
    body: 'ClipVault does not collect, transmit, or share any personal data with us or any third party.\n\n• Snippet content — titles, text, colours, and categories you create are stored exclusively on your device using encrypted local storage (MMKV with AES-256).\n• No account, login, or registration is required.\n• No usage analytics or crash reporting is collected by us.',
  },
  {
    title: 'Local Storage & Encryption',
    body: 'All snippet data is stored locally on your device. Encryption keys are generated on first launch and stored in the Android Keystore — a hardware-backed secure store that prevents key extraction even if the device is compromised. Your data never leaves your device through our App.',
  },
  {
    title: 'Clipboard Access',
    body: 'The App writes to your device clipboard only when you explicitly tap "Copy" on a snippet. The App does not read your clipboard in the background, does not monitor clipboard changes, and does not access clipboard content from other apps.',
  },
  {
    title: 'Home Screen Widget',
    body: 'The widget displays snippet titles on your home screen. Snippet content (the text you copy) is stored in a separate protected store and is only accessed when you tap a widget row to copy it. Snippet content is never displayed on the home screen.',
  },
  {
    title: 'Advertising',
    body: "The free version of the App displays banner advertisements served by Google AdMob. AdMob may collect device identifiers and usage data in accordance with Google's privacy policy to serve relevant ads. Ads are requested with the \"non-personalised ads\" flag set by default. You can remove ads permanently via an in-app purchase.",
  },
  {
    title: 'Internet Permission',
    body: 'The App requests internet access solely to load advertisements via Google AdMob. No snippet data, usage data, or device information is transmitted by the App itself.',
  },
  {
    title: "Children's Privacy",
    body: 'The App is not directed at children under the age of 13. We do not knowingly collect personal information from children.',
  },
  {
    title: 'Changes to This Policy',
    body: "We may update this Privacy Policy from time to time. Any changes will be reflected in the App's settings screen. Continued use of the App after changes constitutes acceptance of the updated policy.",
  },
  {
    title: 'Contact',
    body: 'If you have any questions about this Privacy Policy or your data, please contact us at:\n\nhorizenapps@gmail.com',
  },
];

export function PrivacyPolicyScreen({ visible, onClose }: PrivacyPolicyScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : SCREEN_HEIGHT,
      useNativeDriver: true,
      bounciness: 0,
      speed: 14,
    }).start();
  }, [visible]);

  if (!visible && slideAnim._value === SCREEN_HEIGHT) return null;

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: SurfaceLevel2, transform: [{ translateY: slideAnim }], elevation: 32 },
      ]}
    >
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, {
        borderBottomColor: colors.outlineVariant,
        paddingTop: Math.max(insets.top, 32) + 8,
      }]}>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Privacy Policy</Text>
        <Pressable onPress={onClose} hitSlop={16} style={styles.closeBtn}>
          <Text style={[styles.closeText, { color: colors.onSurfaceVariant }]}>✕</Text>
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.lastUpdated, { color: colors.onSurfaceVariant }]}>
          Last updated: June 2025
        </Text>

        {SECTIONS.map((section) => (
          <View key={section.title} style={[styles.card, { backgroundColor: SurfaceLevel3 }]}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
              {section.title}
            </Text>
            <Text style={[styles.sectionBody, { color: colors.onSurfaceVariant }]}>
              {section.body}
            </Text>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
  scroll: { padding: 16, gap: 10 },
  lastUpdated: { fontSize: 12, marginBottom: 4, marginLeft: 2 },
  card: { borderRadius: 14, padding: 16, gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  sectionBody: { fontSize: 14, lineHeight: 21 },
});
