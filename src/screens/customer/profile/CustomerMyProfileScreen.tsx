import { useNavigation } from '@react-navigation/native';
import { pickImageFromLibrary } from '@/utils/nativeImagePicker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { uploadFiles } from '@/api/uploads';

import { AuthToolPattern } from '@/components/shared/auth-tool-pattern';
import { AuthPalette } from '@/constants/theme';
import { useUpdateUserProfile, useUserProfile } from '@/hooks/useProfile';

const { NAVY, WHITE, GRAY } = { ...AuthPalette, WHITE: '#FFFFFF' };
const RED = '#EF4444';

export function CustomerMyProfileScreen() {
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading, error, refetch } = useUserProfile();
  const updateProfile = useUpdateUserProfile();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [about, setAbout] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
      setName(fullName);
      setEmail(profile.email || '');

      const combinedPhone = profile.countryCode
        ? `${profile.countryCode} ${profile.phone}`
        : (profile.phone || '');
      setPhone(combinedPhone);

      setAddress(profile.address || '');
      setAbout(profile.description || '');
      setSelectedImage(null); // Reset when profile changes (e.g., after success)
    }
  }, [profile]);

  const pickImage = async () => {
    try {
      const asset = await pickImageFromLibrary({ quality: 0.7 });
      if (asset) {
        setSelectedImage(asset.uri);
      }
    } catch (err) {
      console.error('Pick image error:', err);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Split name into first and last name
      const nameParts = name.trim().split(/\s+/);
      const first_name = nameParts[0] || '';
      const last_name = nameParts.slice(1).join(' ') || '';

      let profile_image = profile?.profile_image;

      if (selectedImage) {
        try {
          const uploaded = await uploadFiles(
            [{ uri: selectedImage }],
            { rootFolder: 'profile-pics' }
          );
          if (uploaded && uploaded.length > 0) {
            profile_image = uploaded[0].url;
          }
        } catch (uploadErr) {
          console.error('Upload failed:', uploadErr);
          Alert.alert('Upload Error', 'Failed to upload profile picture.');
          setIsSaving(false);
          return;
        }
      }

      const payload = {
        first_name,
        last_name,
        phone: phone.trim(),
        address: address.trim(),
        description: about.trim(),
        profile_image: profile_image || undefined,
      };

      await updateProfile.mutateAsync(payload);
      setIsEditing(false);
      setSelectedImage(null);
    } catch (err) {
      console.error('Failed to update profile:', err);
      Alert.alert('Update failed', 'Could not save profile changes.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator size="large" color={NAVY} />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={[styles.root, styles.center]}>
        <Text style={styles.errorText}>Failed to load profile.</Text>
        <Pressable style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <AuthToolPattern />

        {/* Curved Header Header */}
        <View style={styles.header}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerRow}>
              <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2.5">
                  <Path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </Pressable>

              <Text style={styles.headerTitle}>My Profile</Text>

              {!isEditing ? (
                <Pressable onPress={() => setIsEditing(true)} style={styles.editBtn}>
                  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2">
                    <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </Svg>
                </Pressable>
              ) : (
                <View style={{ width: 44 }} />
              )}
            </View>
          </SafeAreaView>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Avatar Section */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: selectedImage || profile.profile_image || 'https://i.pravatar.cc/300?u=hamza' }}
                style={styles.avatar}
              />
              {isEditing && (
                <Pressable style={styles.cameraBadge} onPress={pickImage}>
                  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2">
                    <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                    <Circle cx="12" cy="13" r="4" />
                  </Svg>
                </Pressable>
              )}
            </View>

            {!isEditing && (
              <>
                <Text style={styles.nameText}>{name}</Text>
                <View style={styles.ratingRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Svg key={s} width="12" height="12" viewBox="0 0 24 24" fill="#FFB800">
                      <Path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </Svg>
                  ))}
                  <Text style={styles.ratingText}>{profile.avgRating?.toFixed(1) || '0.0'}</Text>
                </View>
              </>
            )}
          </View>

          {isEditing && (
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Full Name"
                placeholderTextColor="#94A3B8"
              />
            </View>
          )}

          {/* Contact Information Card */}
          {!isEditing ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Contact Information</Text>

              <View style={styles.infoRow}>
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GRAY} strokeWidth="1.5">
                  <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <Path d="M22 6l-10 7L2 6" />
                </Svg>
                <Text style={styles.infoText}>{email}</Text>
              </View>

              <View style={styles.infoRow}>
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GRAY} strokeWidth="1.5">
                  <Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 015.06 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </Svg>
                <Text style={styles.infoText}>{phone}</Text>
              </View>

              <View style={styles.infoRow}>
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GRAY} strokeWidth="1.5">
                  <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <Circle cx="12" cy="10" r="3" />
                </Svg>
                <Text style={styles.infoText}>{address}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.editSection}>
              <Text style={styles.cardTitle}>Contact Information</Text>
              <View style={styles.inputGroupTop}>
                <TextInput
                  style={styles.inputFilled}
                  value={email}
                  editable={false}
                  onChangeText={setEmail}
                  placeholder="Email Address"
                  placeholderTextColor="#94A3B8"
                />
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Phone Number"
                  placeholderTextColor="#94A3B8"
                />
                <TextInput
                  style={styles.input}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Address"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>
          )}

          {/* About Me Card */}
          {!isEditing ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>About Me</Text>
              <Text style={styles.aboutText}>{about}</Text>
            </View>
          ) : (
            <View style={styles.editSection}>
              <Text style={styles.cardTitle}>About Me</Text>
              <TextInput
                style={styles.textArea}
                value={about}
                onChangeText={setAbout}
                placeholder="Tell us about yourself..."
                placeholderTextColor="#94A3B8"
                multiline
                textAlignVertical="top"
              />
            </View>
          )}

          {/* Bottom Sticky Buttons */}
          {!isEditing ? (
            <View style={styles.footer}>
              <Pressable style={styles.dashboardBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.dashboardBtnText}>Back To Dashboard</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.footerRow}>
              <Pressable style={styles.declineBtn} onPress={() => setIsEditing(false)}>
                <Text style={styles.declineBtnText}>Decline</Text>
              </Pressable>
              <Pressable
                style={[styles.saveBtn, (isSaving || updateProfile.isPending) && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={isSaving || updateProfile.isPending}
              >
                {isSaving || updateProfile.isPending ? (
                  <ActivityIndicator color={WHITE} size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Save</Text>
                )}
              </Pressable>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: WHITE,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: RED,
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: NAVY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryBtnText: {
    color: WHITE,
    fontWeight: '600',
  },
  header: {
    backgroundColor: NAVY,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingHorizontal: 20,
    paddingBottom: 24,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '500',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 30,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#F1F5F9',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: WHITE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '700',
    color: NAVY,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: NAVY,
    marginLeft: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputGroupTop: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1E293B',
    backgroundColor: WHITE,
  },
  inputFilled: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1E293B',
    backgroundColor: '#F8FAFC', // Slightly gray specifically for email usually
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#475569',
    backgroundColor: WHITE,
    minHeight: 120,
    lineHeight: 22,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  editSection: {
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: NAVY,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
  },
  aboutText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  dashboardBtn: {
    backgroundColor: NAVY,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashboardBtnText: {
    color: WHITE,
    fontWeight: '600',
    fontSize: 16,
  },
  footerRow: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: Platform.OS === 'ios' ? 40 : 20,
    flexDirection: 'row',
    gap: 12,
  },
  declineBtn: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
  },
  declineBtnText: {
    color: RED,
    fontWeight: '600',
    fontSize: 16,
  },
  saveBtn: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: WHITE,
    fontWeight: '600',
    fontSize: 16,
  },
});
