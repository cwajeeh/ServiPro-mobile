import Ionicons from 'react-native-vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

interface FormInputProps extends TextInputProps {
  label?: string;
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
  error?: string;
}

export function FormInput({ label, style, iconName, ...props }: FormInputProps) {
  const isMultiline = props.multiline;

  return (
    <View style={styles.container}>
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}
      <View style={[
        styles.inputWrapper,
        isMultiline && { height: undefined, minHeight: 120, alignItems: 'flex-start', paddingVertical: Spacing.two }
      ]}>
        <TextInput
          style={[styles.input, isMultiline && { textAlignVertical: 'top' }, style]}
          placeholderTextColor="#999"
          {...props}
        />
        {iconName && <Ionicons name={iconName} size={20} color="#999" style={isMultiline && { marginTop: Spacing.one }} />}
      </View>
      {props.error ? <ThemedText style={styles.errorText}>{props.error}</ThemedText> : null}
    </View>
  );
}

interface FormSelectProps {
  label?: string;
  placeholder: string;
  value?: string;
  onPress?: () => void;
  error?: string;
}

export function FormSelect({ label, placeholder, value, onPress, error }: FormSelectProps) {
  return (
    <View style={styles.container}>
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}
      <TouchableOpacity style={styles.inputWrapper} onPress={onPress} activeOpacity={0.7}>
        <ThemedText style={[styles.placeholder, value && styles.value]}>
          {value || placeholder}
        </ThemedText>
        <Ionicons name="chevron-down" size={20} color="#999" />
      </TouchableOpacity>
      {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.three,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: Spacing.one,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    height: 54,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#333',
  },
  placeholder: {
    flex: 1,
    fontSize: 14,
    color: '#999',
  },
  value: {
    color: '#333',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
