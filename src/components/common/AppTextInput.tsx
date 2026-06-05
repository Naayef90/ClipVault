import React, { forwardRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface AppTextInputProps extends TextInputProps {
  label: string;
  error?: string;
  maxLength?: number;
  helper?: string;
}

export const AppTextInput = forwardRef<TextInput, AppTextInputProps>(
  ({ label, error, maxLength, helper, value = '', style, ...rest }, ref) => {
    const { colors } = useTheme();
    const [focused, setFocused] = useState(false);

    const borderColor = error
      ? colors.error
      : focused
      ? colors.primary
      : colors.outline;

    const labelColor = error
      ? colors.error
      : focused
      ? colors.primary
      : colors.onSurfaceVariant;

    return (
      <View style={styles.wrapper}>
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        <View
          style={[
            styles.inputContainer,
            {
              borderColor,
              borderWidth: focused ? 2 : 1,
              backgroundColor: colors.surfaceVariant + '40',
            },
          ]}
        >
          <TextInput
            ref={ref}
            value={value}
            maxLength={maxLength}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={[
              styles.input,
              { color: colors.onSurface },
              style,
            ]}
            placeholderTextColor={colors.onSurfaceVariant}
            cursorColor={colors.primary}
            selectionColor={`${colors.primary}60`}
            {...rest}
          />
          {maxLength !== undefined && (
            <Text style={[styles.counter, { color: colors.onSurfaceVariant }]}>
              {value.length}/{maxLength}
            </Text>
          )}
        </View>
        {(error || helper) && (
          <Text
            style={[
              styles.helper,
              { color: error ? colors.error : colors.onSurfaceVariant },
            ]}
          >
            {error ?? helper}
          </Text>
        )}
      </View>
    );
  },
);

AppTextInput.displayName = 'AppTextInput';

const styles = StyleSheet.create({
  wrapper: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  inputContainer: {
    borderRadius: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    padding: 0,
    margin: 0,
    textAlignVertical: 'top',
  },
  counter: {
    fontSize: 11,
    marginBottom: 2,
  },
  helper: {
    fontSize: 12,
    marginTop: 2,
    marginLeft: 12,
  },
});
