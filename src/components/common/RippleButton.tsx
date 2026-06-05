import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface RippleButtonProps extends PressableProps {
  label: string;
  variant?: 'filled' | 'tonal' | 'outlined' | 'text';
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export function RippleButton({
  label,
  variant = 'filled',
  icon,
  style,
  labelStyle,
  fullWidth = false,
  disabled,
  ...rest
}: RippleButtonProps) {
  const { colors } = useTheme();

  const containerStyle: ViewStyle = {
    backgroundColor:
      variant === 'filled'
        ? colors.primary
        : variant === 'tonal'
        ? colors.secondaryContainer
        : 'transparent',
    borderWidth: variant === 'outlined' ? 1 : 0,
    borderColor: variant === 'outlined' ? colors.outline : undefined,
    opacity: disabled ? 0.38 : 1,
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
  };

  const labelColor =
    variant === 'filled'
      ? colors.onPrimary
      : variant === 'tonal'
      ? colors.onSecondary
      : colors.primary;

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      android_ripple={{
        color:
          variant === 'filled'
            ? 'rgba(255,255,255,0.24)'
            : `${colors.primary}40`,
        borderless: false,
      }}
      style={({ pressed }) => [
        styles.base,
        containerStyle,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.inner}>
        {icon && <View style={styles.iconSlot}>{icon}</View>}
        <Text style={[styles.label, { color: labelColor }, labelStyle]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 100,
    overflow: 'hidden',
    minWidth: 64,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
    gap: 8,
  },
  iconSlot: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  pressed: {
    opacity: 0.92,
  },
});
