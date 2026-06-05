import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SNIPPET_ACCENT_COLORS } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface ColorPickerProps {
  selected: string;
  onSelect: (color: string) => void;
}

export function ColorPicker({ selected, onSelect }: ColorPickerProps) {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {SNIPPET_ACCENT_COLORS.map((color) => {
        const isSelected = color === selected;
        return (
          <Pressable
            key={color}
            onPress={() => onSelect(color)}
            android_ripple={{ color: 'rgba(255,255,255,0.3)', borderless: true }}
            style={styles.swatch}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
          >
            <View
              style={[
                styles.circle,
                { backgroundColor: color },
                isSelected && {
                  borderWidth: 3,
                  borderColor: colors.onSurface,
                },
              ]}
            />
            {isSelected && (
              <View style={[styles.checkmark, { borderColor: color }]}>
                <View style={[styles.checkInner, { backgroundColor: color }]} />
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const SWATCH_SIZE = 36;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  swatch: {
    width: SWATCH_SIZE + 8,
    height: SWATCH_SIZE + 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: (SWATCH_SIZE + 8) / 2,
  },
  circle: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: SWATCH_SIZE / 2,
  },
  checkmark: {
    position: 'absolute',
    width: SWATCH_SIZE + 8,
    height: SWATCH_SIZE + 8,
    borderRadius: (SWATCH_SIZE + 8) / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
