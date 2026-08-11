import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StatusBar } from '@/components/shared/RnStatusBar';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, FlatList, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import { SafeAreaView } from 'react-native-safe-area-context';

import { apiClient } from '@/api/client';
import { fetchServiceCategories, fetchServiceSubcategories } from '@/api/services';
import type { ServiceCategory, ServiceSubcategory } from '@/types/services';

import { FormInput, FormSelect } from '@/components/customer/create-task/FormElements';
import { FormRadio, ImageUploadArea, type UploadedImage } from '@/components/customer/create-task/InteractiveElements';
import { PriceRangeSlider } from '@/components/customer/create-task/PriceRangeSlider';
import { SelectionModal, type SelectionOption } from '@/components/customer/create-task/SelectionModal';
import { ThemedText } from '@/components/themed-text';
import { ENV } from '@/config/env';
import { AuthPalette, Spacing } from '@/constants/theme';
import { useCustomerTabNavigation } from '@/navigation/hooks';
import { useTaskSocketStore } from '@/store/taskSocketStore';
import { logUnexpectedError } from '@/utils/devLog';
import { extractTaskIdFromResponse } from '@/utils/extractTaskId';
import { getCurrentPosition, requestLocationPermission, showLocationSettingsAlert } from '@/utils/nativeLocation';
import { reverseGeocodeLatLng } from '@/utils/reverseGeocode';

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export function CreateTaskScreen() {
  const navigation = useCustomerTabNavigation();
  const placesRef = React.useRef<GooglePlacesAutocompleteRef>(null);
  const onTaskCreated = useTaskSocketStore((s) => s.onTaskCreated);
  const subscribeTask = useTaskSocketStore((s) => s.subscribeTask);

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
    let cleanupTaskCreated: (() => void) | null = null;

    try {
      cleanupTaskCreated = onTaskCreated((task) => {
        console.log('Task created (same room):', task);
      });

      const formData = new FormData();

      // Basic fields
      const { title, description } = getValues();
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
      formData.append('scheduledDate', new Date().toISOString());
      formData.append('taskLength', workingHours || '1 hr');
      // Add files
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

      // Handle response status if needed
      if (data && typeof data === 'object' && 'statusCode' in data) {
        const sc = data.statusCode as number;
        if (sc !== 200 && sc !== 201) {
          throw new Error((data as any).message || 'Failed to create task');
        }
      }

      const createdTaskId = extractTaskIdFromResponse(data);
      if (createdTaskId != null) {
        subscribeTask(createdTaskId);
      }

      navigation.navigate('CustomerMatching', {
        taskId: createdTaskId ?? undefined,
        title: getValues('title'),
        description: getValues('description'),
        categoryName: selectedCategory.name,
        workingHours: workingHours || '1 hr',
        budget: priceType === 'hourly' ? priceRange.min : 0,
        amountType: priceType,
      });
    } catch (err: unknown) {
      logUnexpectedError('createTaskWithFormData', err);
      Alert.alert('Error', errorMessage(err, 'Failed to create task.'));
    } finally {
      cleanupTaskCreated?.();
      setIsSubmitting(false);
    }
  };

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
        keyExtractor={() => 'create-task-form'}
        ListHeaderComponent={
          <View style={styles.formCard}>
            <ThemedText style={styles.cardTitle}>Create A Task</ThemedText>

            {/* Quick/Schedule Toggle */}
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleButton, taskType === 'quick' && styles.activeToggle]}
                onPress={() => setTaskType('quick')}
              >
                <ThemedText style={[styles.toggleText, taskType === 'quick' && styles.activeToggleText]}>
                  Quick
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, taskType === 'scheduled' && styles.activeToggle]}
                onPress={() => setTaskType('scheduled')}
              >
                <ThemedText style={[styles.toggleText, taskType === 'scheduled' && styles.activeToggleText]}>
                  Schedule
                </ThemedText>
              </TouchableOpacity>
            </View>

            {taskType === 'scheduled' && (
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
            )}

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
            {/* Price Section */}
            <ThemedText style={styles.sectionLabel}>Price</ThemedText>
            <View style={styles.priceTypeRow}>
              <FormRadio
                label="Get a quote"
                isSelected={priceType === 'fixed'}
                onPress={() => setPriceType('fixed')}
              />
              <FormRadio
                label="Price/hr"
                isSelected={priceType === 'hourly'}
                onPress={() => setPriceType('hourly')}
              />
            </View>

            {priceType === 'hourly' && (
              <>
                <PriceRangeSlider
                  onValueChange={(min, max) => setPriceRange({ min, max })}
                  initialLow={priceRange.min}
                  initialHigh={priceRange.max}
                />
                <View style={{ marginTop: Spacing.two }}>
                  <FormSelect
                    placeholder="Select Hours"
                    label="Working Hours"
                    value={workingHours}
                    onPress={() => setHoursModalOpen(true)}
                  />
                </View>
              </>
            )}

            <View style={styles.locationContainer}>
              <View style={styles.locationHeader}>
                <ThemedText style={styles.sectionLabel}>Your Location</ThemedText>
              </View>
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
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      {/* Select Modals */}
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
  scrollView: {
    flex: 1,
    marginTop: -30,
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
  },
  formCard: {
    marginTop: 50,
    backgroundColor: '#FFF',
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
    fontWeight: '500',
    color: '#333',
    marginBottom: Spacing.three,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 25,
    padding: 4,
    marginBottom: Spacing.four,
  },
  toggleButton: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  activeToggle: {
    backgroundColor: '#FFE5CC',
  },
  toggleText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  activeToggleText: {
    color: '#333',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: Spacing.two,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: Spacing.two,
  },
  priceTypeRow: {
    flexDirection: 'row',
    marginBottom: Spacing.two,
  },
  locationContainer: {
    marginBottom: Spacing.four,
    zIndex: 1000, // Ensure dropdown stays on top
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  detectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detectText: {
    fontSize: 12,
    color: AuthPalette.NAVY,
    fontWeight: '600',
  },
  locationInputText: {
    height: 54,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    fontSize: 14,
    color: '#333',
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
    color: '#333',
  },
  createButton: {
    backgroundColor: AuthPalette.NAVY,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
    opacity: 0.9,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
