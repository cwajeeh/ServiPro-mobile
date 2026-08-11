import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from '@/components/shared/RnStatusBar';
import React, { useMemo } from 'react';
import {
  Alert,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { nativeEnv } from '@/config/nativeEnv';
import { AuthPalette, Brand, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';

const { NAVY } = AuthPalette;

export function CustomerReferralScreen() {
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);

  const referralCode = useMemo(() => {
    const raw = user as unknown as Record<string, unknown> | null;
    const code =
      (typeof raw?.referral_code === 'string' && raw.referral_code) ||
      (typeof raw?.referralCode === 'string' && raw.referralCode) ||
      (user?.id != null ? `SRV${user.id}` : 'SERV2025');
    return String(code);
  }, [user]);

  const referralLink = `${nativeEnv.webBaseUrl}/r/${referralCode}`;

  const copyCode = async () => {
    try {
      await Share.share({ message: referralCode });
    } catch {
      Alert.alert('Referral code', referralCode);
    }
  };

  const shareLink = async () => {
    try {
      await Share.share({
        message: `Join Servisca with my referral code ${referralCode}: ${referralLink}`,
        url: referralLink,
      });
    } catch {
      // user cancelled
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <View style={styles.headerContainer}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Refer a friend</Text>
            <View style={{ width: 44 }} />
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Referral Code Link</Text>

          <View style={styles.linkContainer}>
            <Text style={styles.codeText}>{referralCode}</Text>
            <Text style={styles.linkText}>{referralLink}</Text>
            <Text style={styles.linkSubtext}>Share this code with your friends</Text>
          </View>
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.copyBtn} onPress={() => void copyCode()}>
              <Ionicons name="copy-outline" size={20} color="#64748B" style={{ marginRight: 8 }} />
              <Text style={styles.copyBtnText}>Copy Code</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareBtn} onPress={() => void shareLink()}>
              <MaterialCommunityIcons
                name="share-variant-outline"
                size={20}
                color="#FFF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.shareBtnText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    backgroundColor: NAVY,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingBottom: Spacing.four,
  },
  headerContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#FFF',
  },
  container: {
    padding: Spacing.four,
    paddingTop: 40,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 20,
  },
  linkContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  codeText: {
    fontSize: 22,
    fontWeight: '700',
    color: Brand.PRIMARY,
    marginBottom: 8,
  },
  linkText: {
    fontSize: 13,
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  linkSubtext: {
    fontSize: 12,
    color: '#94A3B8',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  copyBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: NAVY,
    borderRadius: 16,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
});
