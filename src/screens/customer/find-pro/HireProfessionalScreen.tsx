import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StatusBar } from '@/components/shared/RnStatusBar';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, FlatList, Image, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import { SafeAreaView } from 'react-native-safe-area-context';

import { apiClient } from '@/api/client';
import { fetchServiceCategories, fetchServiceSubcategories } from '@/api/services';
import type { ServiceCategory, ServiceSubcategory } from '@/types/services';

import { FormInput, FormSelect } from '@/components/customer/create-task/FormElements';
import { ImageUploadArea, type UploadedImage } from '@/components/customer/create-task/InteractiveElements';
import { SelectionModal, type SelectionOption } from '@/components/customer/create-task/SelectionModal';
import { ThemedText } from '@/components/themed-text';
import { ENV } from '@/config/env';
import { AuthPalette, Spacing } from '@/constants/theme';
import { useProviderDetails } from '@/hooks/useProvider';
import { CustomerTabParamList } from '@/navigation/types';
import { logUnexpectedError } from '@/utils/devLog';
import { extractTaskIdFromResponse } from '@/utils/extractTaskId';
import { getCurrentPosition, requestLocationPermission, showLocationSettingsAlert } from '@/utils/nativeLocation';
import { reverseGeocodeLatLng } from '@/utils/reverseGeocode';
import { resolveMediaUrl } from '@/utils/mediaUrl';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export function HireProfessionalScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<CustomerTabParamList, 'CustomerHireProfessional'>>();
  const { providerId } = route.params;

  const { data: profile, isLoading: isProfileLoading } = useProviderDetails(providerId);

  const placesRef = React.useRef<GooglePlacesAutocompleteRef>(null);

  // Form State
  const { control, getValues, trigger, formState: { errors } } = useForm({
    defaultValues: { title: '', description: '' },
    mode: 'onBlur'
  });

  const [taskType, setTaskType] = useState<'quick' | 'scheduled'>('quick');
  const [workingHours, setWorkingHours] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState({ latitude: 0, longitude: 0 });

  const [scheduledDate, setScheduledDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const currentDate = new Date(scheduledDate);
      currentDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setScheduledDate(currentDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const currentDate = new Date(scheduledDate);
      currentDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setScheduledDate(currentDate);
    }
  };

  // Category & Subcategory State
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [subCategories, setSubCategories] = useState<ServiceSubcategory[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<ServiceSubcategory | null>(null);

  // Modals
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [isSubCategoryModalOpen, setSubCategoryModalOpen] = useState(false);

  // Price State
  const [priceType, setPriceType] = useState<'fixed' | 'hourly'>('hourly');
  const [priceRange, setPriceRange] = useState({ min: 16, max: 56 });
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const [isHoursModalOpen, setHoursModalOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load parent categories on mount
  useEffect(() => {
    fetchServiceCategories()
      .then(setCategories)
      .catch((err) => logUnexpectedError('fetchServiceCategories', err));
  }, []);

  // Sync selected category if profile loaded
  useEffect(() => {
    if (profile && categories.length > 0) {
      const matchedCat = categories.find(c => Number(c.id) === profile.categoryid);
      if (matchedCat) {
        setSelectedCategory(matchedCat);
        fetchServiceSubcategories(matchedCat.id)
          .then(setSubCategories)
          .catch((err) => logUnexpectedError('fetchServiceSubcategories', err));
      }
    }
  }, [profile, categories]);

  // Handle Category Selection
  const handleSelectCategory = (cat: SelectionOption) => {
    const matched = categories.find((c) => String(c.id) === String(cat.id));
    if (matched) {
      setSelectedCategory(matched);
      setSelectedSubCategory(null); // Reset subcategory when category changes
      fetchServiceSubcategories(matched.id)
        .then(setSubCategories)
        .catch((err) => logUnexpectedError('fetchServiceSubcategories', err));
    }
  };

  const handleGetCurrentLocation = async () => {
    try {
      const granted = await requestLocationPermission();
      if (!granted) {
        showLocationSettingsAlert();
        return;
      }

      setIsSubmitting(true);
      const { latitude, longitude } = await getCurrentPosition();

      setCoordinates({ latitude, longitude });

      const formatted = await reverseGeocodeLatLng(latitude, longitude);
      if (formatted) {
        setAddress(formatted);
        placesRef.current?.setAddressText(formatted);
      }
    } catch (err) {
      logUnexpectedError('handleGetCurrentLocation', err);
      Alert.alert('Error', 'Failed to get current location.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    const isValid = await trigger();
    const { title, description } = getValues();

    if (!isValid || !title.trim() || !description.trim() || !address.trim() || !selectedCategory || !selectedSubCategory) {
      Alert.alert('Validation Error', 'Please fill in all required fields and select a category/subcategory.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append('title', title);
      formData.append('description', description);
      formData.append('amount_type', priceType);
      formData.append('amount', (priceType === 'hourly' ? priceRange.min : 0) as any);
      formData.append('categoryId', Number(selectedCategory.id) as any);
      formData.append('subcategoryId', Number(selectedSubCategory.id) as any);
      formData.append('latitude', coordinates.latitude as any);
      formData.append('longitude', coordinates.longitude as any);
      formData.append('address', address);
      formData.append('type', taskType === 'quick' ? 'quick' : 'schedule');
      formData.append('scheduledDate', scheduledDate.toISOString());
      formData.append('taskLength', workingHours || '1 hr');
      formData.append('providerId', String(providerId));

      if (uploadedImages.length > 0) {
        uploadedImages.forEach((img, index) => {
          const uri = Platform.OS === 'ios' ? img.uri.replace('file://', '') : img.uri;
          const fileName = img.uri.split('/').pop() || `image_${index}.jpg`;
          formData.append('files', {
            uri,
            name: fileName,
            type: img.mimeType || 'image/jpeg',
          } as any);
        });
      }

      const { data } = await apiClient.post('/tasks/with-form-data', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (data && typeof data === 'object' && (data.statusCode === 200 || data.statusCode === 201)) {
        const createdTaskId = extractTaskIdFromResponse(data);
        navigation.navigate('CustomerMatching', {
          taskId: createdTaskId ?? undefined,
          title: getValues('title'),
          description: getValues('description'),
          categoryName: selectedCategory.name,
          workingHours: workingHours || '1 hr',
          budget: priceType === 'hourly' ? priceRange.min : 0,
          amountType: priceType,
        });
      } else {
        throw new Error(data.message || 'Failed to create task');
      }

    } catch (err: unknown) {
      logUnexpectedError('createTaskWithFormData', err);
      Alert.alert('Error', errorMessage(err, 'Failed to create task.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isProfileLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={AuthPalette.NAVY} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.headerContainer}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Hire A Professional</ThemedText>
          </View>
        </SafeAreaView>
      </View>

      <FlatList
        data={[]}
        renderItem={null}
        keyExtractor={() => 'hire-pro-form'}
        ListHeaderComponent={
          <View style={styles.container}>
            {/* Provider Card */}
            {profile && (
              <View style={styles.providerCard}>
                <View style={styles.providerTop}>
                  <Image
                    source={{ uri: resolveMediaUrl(profile.profile_image) || 'https://via.placeholder.com/150' }}
                    style={styles.providerAvatar}
                  />
                  <View style={styles.providerInfo}>
                    <View style={styles.providerNameRow}>
                      <ThemedText style={styles.providerName}>{profile.first_name} {profile.last_name}</ThemedText>
                      <View style={styles.statusBadge}>
                        <View style={styles.statusDot} />
                        <ThemedText style={styles.statusText}>Available</ThemedText>
                      </View>
                    </View>
                    <ThemedText style={styles.providerCategory}>{profile.categoryname || 'Professional'}</ThemedText>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <ThemedText style={styles.ratingText}>{profile.rating || '0.0'}</ThemedText>
                    </View>
                    <View style={styles.addressRow}>
                      <Ionicons name="location-outline" size={14} color="#64748B" />
                      <ThemedText style={styles.addressText} numberOfLines={2}>{profile.address || 'Address not listed'}</ThemedText>
                    </View>
                  </View>
                </View>
                <ThemedText style={styles.priceTag}>£{profile.price_hourly}/hr</ThemedText>
              </View>
            )}

            <View style={styles.formCard}>
              <ThemedText style={styles.cardTitle}>Create A Task</ThemedText>

              {/* Date/Time Row */}
              <View style={styles.dateTimeRow}>
                <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
                  <ThemedText style={styles.dateText}>
                    {scheduledDate.toLocaleDateString()}
                  </ThemedText>
                  <Ionicons name="calendar-outline" size={20} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.dateInput} onPress={() => setShowTimePicker(true)}>
                  <ThemedText style={styles.dateText}>
                    {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </ThemedText>
                  <Ionicons name="time-outline" size={20} color="#999" />
                </TouchableOpacity>
              </View>

              {/* Form Fields */}
              <FormSelect
                placeholder="Category"
                label="Category"
                value={selectedCategory?.name}
                onPress={() => setCategoryModalOpen(true)}
              />
              <FormSelect
                placeholder="Sub Category"
                label="Sub Category"
                value={selectedSubCategory?.name}
                onPress={() => {
                  if (!selectedCategory) {
                    Alert.alert('Notice', 'Please select a Category first.');
                    return;
                  }
                  setSubCategoryModalOpen(true);
                }}
              />
              <Controller
                control={control}
                name="title"
                rules={{ required: 'Title is required' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    placeholder="Task Title"
                    label="Task Title"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.title?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="description"
                rules={{ required: 'Description is required' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    placeholder="Describe your task..."
                    label="Task Description"
                    multiline
                    numberOfLines={4}
                    style={styles.textArea}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.description?.message}
                  />
                )}
              />

              <FormSelect
                placeholder="Select Hours"
                label="Estimated Working Hours"
                value={workingHours}
                onPress={() => setHoursModalOpen(true)}
              />

              <View style={styles.locationContainer}>
                <ThemedText style={styles.sectionLabel}>Your Location</ThemedText>
                <GooglePlacesAutocomplete
                  ref={placesRef}
                  placeholder="Search for location"
                  onPress={(data, details = null) => {
                    setAddress(data.description);
                    if (details) {
                      setCoordinates({
                        latitude: details.geometry.location.lat,
                        longitude: details.geometry.location.lng,
                      });
                    }
                  }}
                  query={{
                    key: ENV.GOOGLE_MAPS_API_KEY,
                    language: 'en',
                  }}
                  fetchDetails={true}
                  styles={{
                    container: { flex: 0 },
                    textInput: styles.locationInputText,
                    listView: styles.locationListView,
                  }}
                  textInputProps={{
                    placeholderTextColor: '#999',
                  }}
                  renderRightButton={() => (
                    <TouchableOpacity onPress={handleGetCurrentLocation} style={styles.locationIconBtn}>
                      <Ionicons name="locate-outline" size={24} color="#999" />
                    </TouchableOpacity>
                  )}
                />
              </View>

              <ImageUploadArea
                images={uploadedImages}
                onImagesChange={setUploadedImages}
              />

              <TouchableOpacity style={styles.createButton} onPress={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <ThemedText style={styles.createButtonText}>Create Task</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      <SelectionModal
        visible={isCategoryModalOpen}
        title="Select Category"
        options={categories.map(c => ({ id: c.id, name: c.name }))}
        onClose={() => setCategoryModalOpen(false)}
        onSelect={handleSelectCategory}
      />

      <SelectionModal
        visible={isSubCategoryModalOpen}
        title="Select Sub Category"
        options={subCategories.map(c => ({ id: c.id, name: c.name }))}
        onClose={() => setSubCategoryModalOpen(false)}
        onSelect={(opt) => setSelectedSubCategory(subCategories.find(s => String(s.id) === String(opt.id)) || null)}
      />

      <SelectionModal
        visible={isHoursModalOpen}
        title="Select Hours"
        options={[
          { id: '1-2 hrs', name: '1-2 hrs' },
          { id: '2-4 hrs', name: '2-4 hrs' },
          { id: '4-6 hrs', name: '4-6 hrs' },
          { id: '6-8 hrs', name: '6-8 hrs' },
          { id: 'Full Day', name: 'Full Day' },
        ]}
        onClose={() => setHoursModalOpen(false)}
        onSelect={(opt) => {
          setWorkingHours(opt.name);
          setHoursModalOpen(false);
        }}
      />

      {showDatePicker && (
        <DateTimePicker
          value={scheduledDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={scheduledDate}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    backgroundColor: AuthPalette.NAVY,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingBottom: Spacing.four,
    zIndex: 1,
  },
  headerContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#FFF',
  },
  container: {
    paddingTop: 60, // Account for header overlap
  },
  providerCard: {
    backgroundColor: '#FFF',
    marginHorizontal: Spacing.three,
    borderRadius: 24,
    padding: Spacing.four,
    marginBottom: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  providerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
  },
  providerInfo: {
    flex: 1,
    marginLeft: Spacing.three,
  },
  providerNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  providerName: {
    fontSize: 20,
    fontWeight: '700',
    color: AuthPalette.NAVY,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
  },
  providerCategory: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: AuthPalette.NAVY,
    marginLeft: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  addressText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 14,
  },
  priceTag: {
    position: 'absolute',
    right: Spacing.four,
    bottom: Spacing.four,
    fontSize: 18,
    fontWeight: '700',
    color: AuthPalette.NAVY,
  },
  formCard: {
    backgroundColor: '#FFF',
    marginHorizontal: Spacing.three,
    borderRadius: 24,
    padding: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: Spacing.four,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
    gap: Spacing.three,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 54,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
  },
  dateText: {
    fontSize: 14,
    color: '#1E293B',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: Spacing.two,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: Spacing.two,
  },
  locationContainer: {
    marginBottom: Spacing.four,
    zIndex: 1000,
  },
  locationInputText: {
    height: 54,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    fontSize: 14,
    color: '#1E293B',
  },
  locationListView: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginTop: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationIconBtn: {
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  createButton: {
    backgroundColor: AuthPalette.NAVY,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
    shadowColor: AuthPalette.NAVY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
    marginTop: -30,
  },
  scrollContent: {
    // paddingBottom: 100,
  },
});
