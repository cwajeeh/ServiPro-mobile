import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from '@/components/shared/RnStatusBar';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { AuthToolPattern } from '@/components/shared/auth-tool-pattern';
import { AuthPalette, Spacing } from '@/constants/theme';
import type { AuthStackParamList } from '@/navigation/types';

const { NAVY, PRIMARY_TEXT, BORDER, MAIN_BLUE, GRAY } = AuthPalette;

type Props = NativeStackScreenProps<AuthStackParamList, 'TaskerSkillsAndRate'>;

export function TaskerSkillsAndRateScreen({ navigation }: Props) {
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [rate, setRate] = useState('');

  const addSkill = () => {
    if (skillInput.trim()) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <AuthToolPattern />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path d="M15 18l-6-6 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '75%' }]} />
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Create Your Profile</Text>
            
            <Text style={styles.subtitle}>Add Your Skills</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="Enter your skills here separated by ','"
                placeholderTextColor={GRAY}
                value={skillInput}
                onChangeText={setSkillInput}
                onSubmitEditing={addSkill}
                returnKeyType="done"
              />
              <Pressable style={styles.addBtn} onPress={addSkill}>
                <Text style={styles.addBtnText}>+</Text>
              </Pressable>
            </View>

            <View style={styles.chipsContainer}>
              {skills.map((skill, index) => (
                <View key={`${skill}-${index}`} style={styles.chip}>
                  <Text style={styles.chipText}>{skill}</Text>
                  <Pressable onPress={() => removeSkill(index)} style={styles.removeBtn}>
                    <Text style={styles.removeText}>✕</Text>
                  </Pressable>
                </View>
              ))}
            </View>

            <Text style={styles.subtitle}>Enter Your Hourly Rate</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.currencyPrefix}>$</Text>
              <TextInput
                style={[styles.input, styles.currencyInput]}
                placeholder="Enter your rate here"
                placeholderTextColor={GRAY}
                keyboardType="numeric"
                value={rate}
                onChangeText={setRate}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed]}
              onPress={() => navigation.navigate('TaskerCertificates')}>
              <Text style={styles.primaryBtnText}>Continue</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  safe: { flex: 1, zIndex: 1 },
  flex: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.four,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: BORDER,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: MAIN_BLUE },
  content: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six },
  title: { fontSize: 24, fontWeight: '700', color: PRIMARY_TEXT, marginBottom: Spacing.four },
  subtitle: { fontSize: 16, color: PRIMARY_TEXT, fontWeight: '600', marginBottom: Spacing.three, marginTop: Spacing.two },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: Spacing.two,
    backgroundColor: '#FAFAFA',
    marginBottom: Spacing.four,
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.select({ ios: 14, default: 12 }),
    fontSize: 15,
    color: PRIMARY_TEXT,
  },
  addBtn: {
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
  },
  addBtnText: {
    fontSize: 22,
    color: GRAY,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    marginBottom: Spacing.six,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#FFF2CC', // Light warm accent from design
  },
  chipText: {
    fontSize: 13,
    color: '#333',
    marginRight: Spacing.two,
  },
  removeBtn: {
    padding: 2,
  },
  removeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '700',
  },
  currencyPrefix: {
    paddingLeft: Spacing.three,
    fontSize: 16,
    color: PRIMARY_TEXT,
    fontWeight: '600',
  },
  currencyInput: {
    paddingLeft: Spacing.one,
  },
  footer: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  primaryBtn: {
    backgroundColor: NAVY,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  primaryBtnPressed: { opacity: 0.9 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
