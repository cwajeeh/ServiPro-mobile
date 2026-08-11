import { uploadFiles } from '@/api/uploads';
import { useMyProviderProfile, useUpdateProviderProfile } from '@/hooks/useProvider';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { TaskerStackParamList } from '@/navigation/types';
import { getMediaBaseUrl } from '@/utils/mediaUrl';
import { pickImageFromLibrary } from '@/utils/nativeImagePicker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
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
import { AuthToolPattern } from '../../../components/shared/auth-tool-pattern';

const NAVY = '#001A6E';
const WHITE = '#FFFFFF';
const GRAY = '#64748B';
const ACCENT_BLUE = '#3A5A98';
const ERROR_RED = '#FF3B30';

const EDIT_TABS = ['About Me', 'Services Info', 'Portfolio'] as const;

export function TaskerEditProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<TaskerStackParamList, 'TaskerEditProfile'>>();
  const [activeTab, setActiveTab] = useState<(typeof EDIT_TABS)[number]>('About Me');

  useEffect(() => {
    const t = route.params?.initialTab;
    if (t && (EDIT_TABS as readonly string[]).includes(t)) {
      setActiveTab(t);
    }
  }, [route.params?.initialTab]);

  const { data: profile } = useMyProviderProfile();
  const { mutate: updateProfile, isPending } = useUpdateProviderProfile();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [priceHourly, setPriceHourly] = useState('0');

  const [skills, setSkills] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);

  const [profileImage, setProfileImage] = useState('https://i.pravatar.cc/300?u=john');
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Cert Modal State
  const [certModalVisible, setCertModalVisible] = useState(false);
  const [editingCertIndex, setEditingCertIndex] = useState<number | null>(null);
  const [certForm, setCertForm] = useState({
    certificate_name: '',
    certificate_type: 'Safety & Protection',
    issue_date: '',
    expiry_date: '',
    description: '',
    file_url: '',
    local_uri: ''
  });

  const [showIssuePicker, setShowIssuePicker] = useState(false);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);

  const formatDateForPayload = (date: Date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const parseDateFromPayload = (dateStr: string) => {
    if (!dateStr) return new Date();
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setCategoryName(profile.categoryname || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
      setDescription(profile.description || '');
      setPriceHourly(profile.price_hourly?.toString() || '0');
      setSkills(profile.skills || []);
      setCertificates(profile.certificates || []);
      setPortfolio(profile.portfolio || []);
      setSubcategories(profile.subcategories || []);
      if (profile.profile_image) {
        setProfileImage(profile.profile_image);
      }
    }
  }, [profile]);

  const pickAvatar = async () => {
    const asset = await pickImageFromLibrary({ quality: 0.7 });
    if (asset) setLocalAvatarUri(asset.uri);
  };

  const openAddCert = () => {
    setCertForm({ certificate_name: '', certificate_type: 'Safety & Protection', issue_date: '', expiry_date: '', description: '', file_url: '', local_uri: '' });
    setEditingCertIndex(null);
    setCertModalVisible(true);
  };

  const openEditCert = (index: number) => {
    const cert = certificates[index];
    setCertForm({
      certificate_name: cert.certificate_name || '',
      certificate_type: cert.certificate_type || 'Safety & Protection',
      issue_date: cert.issue_date || '',
      expiry_date: cert.expiry_date || '',
      description: cert.description || '',
      file_url: cert.file_url || '',
      local_uri: ''
    });
    setEditingCertIndex(index);
    setCertModalVisible(true);
  };

  const deleteCert = (index: number) => {
    const copy = [...certificates];
    copy.splice(index, 1);
    setCertificates(copy);
  };

  const pickCertImage = async () => {
    const asset = await pickImageFromLibrary({ quality: 0.7 });
    if (asset) setCertForm({ ...certForm, local_uri: asset.uri });
  };

  const saveCertModal = async () => {
    let finalUrl = certForm.file_url;
    if (certForm.local_uri) {
      setIsSaving(true);
      try {
        console.log(certForm.local_uri, "------")
        const uploaded = await uploadFiles([{ uri: certForm.local_uri }], { rootFolder: 'provider-certs' });
        if (uploaded && uploaded.length > 0) finalUrl = uploaded[0].url;
      } catch (err) {
        console.error('Cert upload error:', err);
      } finally {
        setIsSaving(false);
      }
    }
    const newCert: any = {
      id: editingCertIndex !== null ? certificates[editingCertIndex].id : 0,
      certificate_name: certForm.certificate_name,
      certificate_type: certForm.certificate_type,
      issue_date: certForm.issue_date,
      expiry_date: certForm.expiry_date,
      description: certForm.description,
      file_url: finalUrl,
    };
    if (editingCertIndex !== null) {
      const copy = [...certificates];
      copy[editingCertIndex] = newCert;
      setCertificates(copy);
    } else {
      setCertificates([...certificates, newCert]);
    }
    setCertModalVisible(false);
  };

  const pickPortfolioImage = async () => {
    const asset = await pickImageFromLibrary({ quality: 0.7 });
    if (asset) {
      setPortfolio([...portfolio, { id: 0, image_url: asset.uri }]);
    }
  };

  const deletePortfolioItem = (index: number) => {
    const copy = [...portfolio];
    copy.splice(index, 1);
    setPortfolio(copy);
  };

  const handleSave = async () => {
    setIsSaving(true);
    let finalProfileImage = profileImage;
    console.log(localAvatarUri, "------")
    if (localAvatarUri) {
      try {
        const uploaded = await uploadFiles([{ uri: localAvatarUri }], { rootFolder: 'profile-pics' });
        if (uploaded && uploaded.length > 0) finalProfileImage = uploaded[0].url;
      } catch (uploadErr) {
        console.log(uploadErr, "------")
        setIsSaving(false);
        return Alert.alert('Error', 'Failed to upload profile image.');
      }
    }

    // Upload Portfolio Images
    const updatedPortfolio = [...portfolio];
    const newPortfolioItems = updatedPortfolio.filter(p => p.id === 0 && p.image_url.startsWith('file://'));

    if (newPortfolioItems.length > 0) {
      try {
        const uploadResults = await uploadFiles(
          newPortfolioItems.map(p => ({ uri: p.image_url })),
          { rootFolder: 'provider/portfolio' }
        );

        let resultIndex = 0;
        newPortfolioItems.forEach(item => {
          item.image_url = uploadResults[resultIndex].url;
          resultIndex++;
        });
      } catch (err) {
        console.error('Portfolio upload error:', err);
        setIsSaving(false);
        return Alert.alert('Error', 'Failed to upload portfolio images.');
      }
    }

    const payload: any = {
      first_name: firstName,
      last_name: lastName,
      description: description,
      phone: phone,
      address: address,
      price_hourly: Number(priceHourly) || 0,
      profile_image: finalProfileImage,
      skills: skills.map((s: any) => s.id === 0 ? { skill_name: s.skill_name } : { id: s.id, skill_name: s.skill_name }),
      certificates: certificates.map((c: any) => c.id === 0 ? {
        certificate_name: c.certificate_name, certificate_type: c.certificate_type, description: c.description, issue_date: c.issue_date, expiry_date: c.expiry_date, file_url: c.file_url
      } : {
        id: c.id, certificate_name: c.certificate_name, certificate_type: c.certificate_type, description: c.description, issue_date: c.issue_date, expiry_date: c.expiry_date, file_url: c.file_url
      }),
      portfolio: updatedPortfolio.map((p: any) => p.id === 0 ? { image_url: p.image_url } : { id: p.id, image_url: p.image_url }),
    };

    updateProfile(payload, {
      onSuccess: () => {
        setIsSaving(false);
        navigation.goBack();
      },
      onError: () => {
        setIsSaving(false);
        Alert.alert('Error', 'Failed to save profile changes.');
      }
    });
  };

  const getFullImageUrl = (url: string | null | undefined) => {
    if (!url) return 'https://i.pravatar.cc/300?u=john';
    if (url.startsWith('http')) return url;

    const baseUrl = getMediaBaseUrl();
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = url.startsWith('/') ? url : `/${url}`;

    return `${cleanBase}${cleanPath}`;
  };

  return (
    <View style={styles.root}>
      <AuthToolPattern />
      {/* Header */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2.5">
                <Path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Pressable>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={{ width: 44 }} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: localAvatarUri || getFullImageUrl(profileImage) }}
              style={styles.avatar}
            />
            <Pressable style={styles.cameraBadge} onPress={pickAvatar}>
              <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2">
                <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <Circle cx="12" cy="13" r="4" />
              </Svg>
            </Pressable>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.fieldGroup}>
            <TextInput
              style={styles.input}
              value={`${firstName} ${lastName}`.trim()}
              onChangeText={(t) => {
                const parts = t.split(' ');
                setFirstName(parts[0] || '');
                setLastName(parts.slice(1).join(' '));
              }}
              placeholder="First Last Name"
            />
          </View>
          <View style={styles.fieldGroup}>
            <TextInput
              style={styles.input}
              value={categoryName}
              editable={false}
              placeholder="Category Name"
            />
          </View>
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          {EDIT_TABS.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </Pressable>
          ))}
        </View>

        {activeTab === 'About Me' && (
          <View style={styles.content}>
            {/* Contact Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              <View style={styles.editField}>
                <TextInput style={styles.input} value={email} editable={false} placeholder="Email" />
              </View>
              <View style={styles.editField}>
                <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Phone Number" />
              </View>
              <View style={styles.editField}>
                <TextInput style={styles.input} value={address} onChangeText={setAddress} multiline placeholder="Address" />
              </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={styles.textArea}
                  multiline
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Description"
                />
              </View>
            </View>

            {/* Certifications */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Certifications</Text>
              {certificates.map((cert, index) => (
                <EditCertificationCard
                  key={cert.id || index}
                  title={cert.certificate_name}
                  date={cert.issue_date}
                  desc={cert.description}
                  fileUrl={cert.file_url}
                  onEdit={() => openEditCert(index)}
                  onDelete={() => deleteCert(index)}
                  getFullImageUrl={getFullImageUrl}
                />
              ))}
              <Pressable style={styles.addBtnLarge} onPress={openAddCert}>
                <Text style={styles.addBtnText}>+ Add Certification</Text>
              </Pressable>
            </View>
          </View>
        )}

        {activeTab === 'Services Info' && (
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Services You Offer</Text>
              <View style={styles.offersRow}>
                {subcategories.filter((s: any) => s.isSelected).map((sub: any) => (
                  <View key={sub.id} style={[styles.offerBadge, { borderColor: NAVY }]}>
                    <Text style={[styles.offerBadgeText, { color: NAVY }]}>{sub.name}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills (Subcategories)</Text>
              {subcategories.filter((s: any) => s.isSelected).map((sub: any, index: number) => (
                <EditSkillCard
                  key={sub.id || index}
                  title={sub.name}
                  badge="Active"
                  badgeColor="#82E0AA"
                />
              ))}
              <Pressable style={styles.addBtnLarge}>
                <Text style={styles.addBtnText}>+ Add New Skill</Text>
              </Pressable>
            </View>
          </View>
        )}

        {activeTab === 'Portfolio' && (
          <View style={styles.content}>
            <Pressable style={styles.uploadBtn} onPress={pickPortfolioImage}>
              <View style={styles.uploadIcon}>
                <Text style={{ fontSize: 24, color: GRAY }}>+</Text>
              </View>
              <Text style={styles.uploadText}>Upload New Work</Text>
            </Pressable>

            <View style={styles.portfolioGrid}>
              {portfolio.map((item: any, index: number) => (
                <View key={item.id || index} style={styles.portfolioItem}>
                  <Image
                    source={{ uri: getFullImageUrl(item.image_url) }}
                    style={styles.portfolioImg}
                  />
                  <Pressable style={styles.deleteBadge} onPress={() => deletePortfolioItem(index)}>
                    <Text style={{ fontSize: 10, color: WHITE }}>✕</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer Actions */}
        <SafeAreaView edges={['bottom']} style={styles.footerRow}>
          <Pressable style={styles.declineBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.declineBtnText}>Decline</Text>
          </Pressable>
          <Pressable
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={isPending || isSaving}
          >
            {isPending || isSaving ? (
              <ActivityIndicator color={WHITE} />
            ) : (
              <Text style={styles.saveBtnText}>Save</Text>
            )}
          </Pressable>
        </SafeAreaView>
      </ScrollView>

      {/* Cert Modal */}
      <Modal visible={certModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{editingCertIndex !== null ? 'Edit Certification' : 'Add Certification'}</Text>
            <ScrollView style={{ maxHeight: 400, width: '100%', marginVertical: 12 }} showsVerticalScrollIndicator={false}>
              <TextInput style={styles.inputModal} placeholder="Certificate Name" value={certForm.certificate_name} onChangeText={(t) => setCertForm({ ...certForm, certificate_name: t })} />
              <TextInput style={styles.inputModal} placeholder="Certificate Type" value={certForm.certificate_type} onChangeText={(t) => setCertForm({ ...certForm, certificate_type: t })} />

              <Pressable style={styles.dateInputModal} onPress={() => setShowIssuePicker(true)}>
                <Text style={{ color: certForm.issue_date ? '#0F172A' : GRAY }}>
                  {certForm.issue_date || 'Issue Date (YYYY-MM-DD)'}
                </Text>
              </Pressable>

              <Pressable style={styles.dateInputModal} onPress={() => setShowExpiryPicker(true)}>
                <Text style={{ color: certForm.expiry_date ? '#0F172A' : GRAY }}>
                  {certForm.expiry_date || 'Expiry Date (YYYY-MM-DD)'}
                </Text>
              </Pressable>

              {showIssuePicker && (
                <DateTimePicker
                  value={parseDateFromPayload(certForm.issue_date)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowIssuePicker(false);
                    if (selectedDate) {
                      setCertForm({ ...certForm, issue_date: formatDateForPayload(selectedDate) });
                    }
                  }}
                />
              )}

              {showExpiryPicker && (
                <DateTimePicker
                  value={parseDateFromPayload(certForm.expiry_date)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowExpiryPicker(false);
                    if (selectedDate) {
                      setCertForm({ ...certForm, expiry_date: formatDateForPayload(selectedDate) });
                    }
                  }}
                />
              )}

              <TextInput style={[styles.inputModal, { height: 80 }]} multiline placeholder="Description" value={certForm.description} onChangeText={(t) => setCertForm({ ...certForm, description: t })} />
              <Pressable style={styles.uploadBtnModal} onPress={pickCertImage}>
                <Text style={styles.uploadTextModal}>{certForm.local_uri || certForm.file_url ? 'Change Image/Doc' : 'Upload Image'}</Text>
              </Pressable>
            </ScrollView>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <Pressable style={styles.declineBtn} onPress={() => setCertModalVisible(false)}>
                <Text style={styles.declineBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={saveCertModal} disabled={isSaving}>
                {isSaving ? (
                  <ActivityIndicator color={WHITE} />
                ) : (
                  <Text style={styles.saveBtnText}>Save Cert</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function EditSkillCard({ title, badge, badgeColor }: { title: string; badge: string; badgeColor: string }) {
  return (
    <View style={styles.skillCard}>
      <View style={styles.skillHeader}>
        <Text style={styles.skillTitle}>{title}</Text>
        <View style={[styles.skillBadge, { backgroundColor: badgeColor }]}>
          <Text style={styles.skillBadgeText}>{badge}</Text>
        </View>
      </View>
      <View style={styles.certActions}>
        <Pressable style={styles.actionBtn}>
          <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT_BLUE} strokeWidth="2">
            <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </Svg>
        </Pressable>
        <Pressable style={[styles.actionBtn, styles.deleteBtn]}>
          <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2">
            <Path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </Svg>
        </Pressable>
      </View>
    </View>
  );
}

function EditCertificationCard({ title, date, desc, fileUrl, onEdit, onDelete, getFullImageUrl }: { title: string; date: string; desc?: string; fileUrl?: string; onEdit: () => void; onDelete: () => void; getFullImageUrl: (u: string | null | undefined) => string }) {
  const imageUrl = getFullImageUrl(fileUrl);
  return (
    <View style={styles.certCard}>
      <View style={styles.certIconWrap}>
        <Image source={{ uri: imageUrl }} style={styles.certImg} />
      </View>
      <View style={styles.certInfo}>
        <Text style={styles.certTitle}>{title}</Text>
        <Text style={styles.certDate}>{date}</Text>
        <Text style={styles.certDesc} numberOfLines={1}>{desc || 'A qualification...'}</Text>
      </View>
      <View style={styles.certActions}>
        <Pressable style={styles.actionBtn} onPress={onEdit}>
          <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT_BLUE} strokeWidth="2">
            <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </Svg>
        </Pressable>
        <Pressable style={[styles.actionBtn, styles.deleteBtn]} onPress={onDelete}>
          <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2">
            <Path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </Svg>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: WHITE },
  header: {
    backgroundColor: NAVY,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: WHITE, fontSize: 20, fontWeight: '500' },
  scroll: { paddingBottom: 40 },
  avatarSection: { alignItems: 'flex-start', marginTop: 20, marginBottom: 20, marginLeft: 20 },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 140, height: 140, borderRadius: 70, borderWidth: 4, borderColor: '#F1F5F9' },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#F1F5F9',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: WHITE,
  },
  inputContainer: { paddingHorizontal: 20, marginBottom: 24 },
  fieldGroup: { marginBottom: 16 },
  input: { height: 56, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, fontSize: 16, color: '#0F172A', backgroundColor: '#F8FAFC' },
  tabBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingHorizontal: 20 },
  tabItem: { paddingVertical: 12, marginRight: 24, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabItemActive: { borderBottomColor: '#FFD700' },
  tabText: { fontSize: 14, color: GRAY, fontWeight: '600' },
  tabTextActive: { color: NAVY },
  content: { padding: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: NAVY, marginBottom: 16 },
  editField: { marginBottom: 12 },
  textAreaContainer: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, backgroundColor: '#F8FAFC', padding: 12, minHeight: 150 },
  textArea: { fontSize: 15, color: '#475569', lineHeight: 22, textAlignVertical: 'top' },
  certCard: { flexDirection: 'row', backgroundColor: WHITE, borderRadius: 16, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9', alignItems: 'center' },
  certIconWrap: { width: 60, height: 50, borderRadius: 8, overflow: 'hidden', backgroundColor: '#F8FAFC', marginRight: 12 },
  certImg: { width: '100%', height: '100%' },
  certInfo: { flex: 1 },
  certTitle: { fontSize: 14, fontWeight: '700', color: NAVY, marginBottom: 2 },
  certDate: { fontSize: 11, color: GRAY, marginBottom: 2 },
  certDesc: { fontSize: 10, color: '#94A3B8' },
  certActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 40, height: 48, borderRadius: 10, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { backgroundColor: '#C00000' },
  offersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  offerBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
  offerBadgeText: { fontSize: 15, color: '#334155', fontWeight: '500' },
  xBtn: { width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center' },
  addBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  skillCard: { backgroundColor: WHITE, borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 },
  skillHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  skillTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B', flex: 1 },
  skillBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginLeft: 8 },
  skillBadgeText: { color: WHITE, fontSize: 10, fontWeight: '700' },
  addBtnLarge: { height: 56, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  addBtnText: { color: GRAY, fontSize: 15, fontWeight: '500' },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F8FAFC', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed' },
  uploadIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: WHITE, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  uploadText: { fontSize: 16, color: GRAY, fontWeight: '600' },
  portfolioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  portfolioItem: { width: '31%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  portfolioImg: { width: '100%', height: '100%' },
  deleteBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: ERROR_RED, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: WHITE },
  footerRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 16, marginTop: 20, marginBottom: 40 },
  declineBtn: { flex: 1, height: 60, borderRadius: 12, borderWidth: 1, borderColor: ERROR_RED, alignItems: 'center', justifyContent: 'center' },
  declineBtnText: { color: ERROR_RED, fontSize: 18, fontWeight: '700' },
  saveBtn: { flex: 1, height: 60, borderRadius: 12, backgroundColor: NAVY, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: WHITE, fontSize: 18, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '90%', backgroundColor: WHITE, borderRadius: 20, padding: 24, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: NAVY, marginBottom: 8 },
  inputModal: { width: '100%', height: 50, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 16, marginBottom: 12, backgroundColor: '#F8FAFC', justifyContent: 'center' },
  dateInputModal: { width: '100%', height: 50, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 16, marginBottom: 12, backgroundColor: '#F8FAFC', justifyContent: 'center' },
  uploadBtnModal: { width: '100%', height: 50, borderWidth: 1, borderColor: NAVY, borderStyle: 'dashed', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  uploadTextModal: { color: NAVY, fontWeight: '600' },
});
