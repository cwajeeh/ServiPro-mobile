import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Spacing } from '@/constants/theme';

const BLACK = '#000000';
const BORDER = '#E0E0E0';
const GRAY = '#757575';
const NAVY = '#001A6E';

export type CountryDial = {
  dial: string;
  flag: string;
  name: string;
  /** ISO 3166-1 alpha-2 (e.g. GB) for APIs such as `/auth/register`. */
  isoCode: string;
};

export const DEFAULT_COUNTRIES: CountryDial[] = [
  { dial: '+92', flag: '🇵🇰', name: 'Pakistan', isoCode: 'PK' },
  { dial: '+1', flag: '🇺🇸', name: 'United States', isoCode: 'US' },
  { dial: '+44', flag: '🇬🇧', name: 'United Kingdom', isoCode: 'GB' },
  { dial: '+971', flag: '🇦🇪', name: 'United Arab Emirates', isoCode: 'AE' },
  { dial: '+91', flag: '🇮🇳', name: 'India', isoCode: 'IN' },
];

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  /** Notified when user picks a country (and on mount). Use with `formatFullPhone` if needed. */
  onCountryChange?: (country: CountryDial) => void;
};

/** Shared phone row: country code + flag (left) and national number (right). Same for User and Tasker. */
export function PhoneCountryField({
  value,
  onChangeText,
  placeholder = 'Phone Number *',
  onCountryChange,
}: Props) {
  const [country, setCountry] = useState<CountryDial>(DEFAULT_COUNTRIES[0]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    onCountryChange?.(country);
  }, [country]);

  const selectCountry = useCallback((c: CountryDial) => {
    setCountry(c);
    setOpen(false);
  }, []);

  return (
    <>
      <View style={styles.wrap}>
        <Pressable
          style={styles.countryZone}
          onPress={() => setOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`Country ${country.name}, ${country.dial}. Tap to change`}>
          <Text style={styles.flag}>{country.flag}</Text>
          <Text style={styles.dial}>{country.dial}</Text>
          <Text style={styles.chev}>▼</Text>
        </Pressable>
        <View style={styles.divider} />
        <TextInput
          style={styles.phoneInput}
          placeholder={placeholder}
          placeholderTextColor={GRAY}
          keyboardType="phone-pad"
          autoComplete="tel-national"
          value={value}
          onChangeText={onChangeText}
        />
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.sheetTitle}>Select country</Text>
            <FlatList
              data={DEFAULT_COUNTRIES}
              keyExtractor={(item) => item.dial + item.name}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.countryRow, item.dial === country.dial && styles.countryRowOn]}
                  onPress={() => selectCountry(item)}>
                  <Text style={styles.countryRowFlag}>{item.flag}</Text>
                  <Text style={styles.countryRowName}>{item.name}</Text>
                  <Text style={styles.countryRowDial}>{item.dial}</Text>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

/** Full E.164-style number for APIs (dial + digits). */
export function formatFullPhone(dial: string, national: string): string {
  const digits = national.replace(/\D/g, '');
  return `${dial.replace('+', '+')}${digits}`;
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    marginBottom: Spacing.three,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  countryZone: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: Platform.select({ ios: 12, default: 10 }),
    gap: 6,
  },
  flag: {
    fontSize: 20,
  },
  dial: {
    fontSize: 16,
    fontWeight: '600',
    color: BLACK,
  },
  chev: {
    fontSize: 10,
    color: GRAY,
    marginLeft: 2,
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: BORDER,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.select({ ios: 14, default: 12 }),
    fontSize: 16,
    color: BLACK,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: Spacing.four,
    maxHeight: '50%',
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    padding: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  countryRowOn: {
    backgroundColor: 'rgba(0,26,110,0.08)',
  },
  countryRowFlag: {
    fontSize: 22,
  },
  countryRowName: {
    flex: 1,
    fontSize: 16,
    color: BLACK,
  },
  countryRowDial: {
    fontSize: 16,
    fontWeight: '600',
    color: NAVY,
  },
});
