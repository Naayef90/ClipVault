import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { SnackbarMessage } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { SurfaceLevel3 } from '../../utils/theme';

interface SnackbarHostProps {
  current: SnackbarMessage | null;
  onDismiss: (id: string) => void;
  bottomOffset?: number;
}

const DISPLAY_DURATION = 3000;
const ANIMATION_DURATION = 200;

export function SnackbarHost({
  current,
  onDismiss,
  bottomOffset = 80,
}: SnackbarHostProps) {
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!current) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 10,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start();

    timerRef.current = setTimeout(() => {
      dismissCurrent();
    }, DISPLAY_DURATION);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current?.id]);

  function dismissCurrent() {
    if (!current) return;
    const id = current.id;
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 120,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      translateY.setValue(120);
      opacity.setValue(0);
      onDismiss(id);
    });
  }

  if (!current) return null;

  const accentColor =
    current.severity === 'success'
      ? colors.success
      : current.severity === 'error'
      ? colors.error
      : colors.primary;

  return (
    <Animated.View
      style={[
        styles.container,
        { bottom: bottomOffset, opacity, transform: [{ translateY }] },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.snackbar,
          {
            backgroundColor: SurfaceLevel3,
            borderLeftWidth: 3,
            borderLeftColor: accentColor,
          },
        ]}
      >
        <Text style={[styles.message, { color: colors.onSurface }]} numberOfLines={2}>
          {current.message}
        </Text>
        <TouchableOpacity onPress={dismissCurrent} hitSlop={12}>
          <Text style={[styles.dismiss, { color: accentColor }]}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 6,
  },
  snackbar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  dismiss: {
    fontSize: 16,
    fontWeight: '700',
  },
});
