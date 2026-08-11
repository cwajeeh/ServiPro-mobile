import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { fetchServiceCategories, fetchServiceSubcategories } from '@/api/services';
import { FormSelect } from '@/components/customer/create-task/FormElements';
import { PriceRangeSlider } from '@/components/customer/create-task/PriceRangeSlider';
import { SelectionModal } from '@/components/customer/create-task/SelectionModal';
import { ThemedText } from '@/components/themed-text';
import { AuthPalette, Spacing } from '@/constants/theme';
import type { ServiceCategory, ServiceSubcategory } from '@/types/services';
import { logUnexpectedError } from '@/utils/devLog';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: {
    categoryId?: string;
    subCategoryId?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => void;
  initialFilters?: {
    categoryId?: string;
    subCategoryId?: string;
    minPrice?: number;
    maxPrice?: number;
  };
}

export function FilterModal({ visible, onClose, onApply, initialFilters }: FilterModalProps) {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [subCategories, setSubCategories] = useState<ServiceSubcategory[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<ServiceSubcategory | null>(null);
  const [priceRange, setPriceRange] = useState({ min: initialFilters?.minPrice ?? 16, max: initialFilters?.maxPrice ?? 56 });

  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [isSubCategoryModalOpen, setSubCategoryModalOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchServiceCategories()
        .then(setCategories)
        .catch((err) => logUnexpectedError('fetchServiceCategories', err));
    }
  }, [visible]);

  useEffect(() => {
    if (visible && initialFilters) {
      setPriceRange({
        min: initialFilters.minPrice ?? 16,
        max: initialFilters.maxPrice ?? 56,
      });
    }
  }, [visible, initialFilters]);

  const handleSelectCategory = (catOpt: { id: string | number; name: string }) => {
    const matched = categories.find((c) => String(c.id) === String(catOpt.id));
    if (matched) {
      setSelectedCategory(matched);
      setSelectedSubCategory(null);
      fetchServiceSubcategories(matched.id)
        .then(setSubCategories)
        .catch((err) => logUnexpectedError('fetchServiceSubcategories', err));
    }
  };

  const handleApply = () => {
    onApply({
      categoryId: selectedCategory?.id,
      subCategoryId: selectedSubCategory?.id,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => { }}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>Filters</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <FormSelect
              label="Category"
              placeholder="Select Category"
              value={selectedCategory?.name}
              onPress={() => setCategoryModalOpen(true)}
            />

            <FormSelect
              label="Sub Category"
              placeholder="Select Sub Category"
              value={selectedSubCategory?.name}
              onPress={() => {
                if (!selectedCategory) return;
                setSubCategoryModalOpen(true);
              }}
            />

            <ThemedText style={styles.sectionLabel}>Select Price Range</ThemedText>
            <PriceRangeSlider
              min={0}
              max={200}
              initialLow={priceRange.min}
              initialHigh={priceRange.max}
              onValueChange={(min, max) => setPriceRange({ min, max })}
            />

            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <ThemedText style={styles.applyButtonText}>Apply Filters</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>

      <SelectionModal
        visible={isCategoryModalOpen}
        title="Select Category"
        options={categories.map((c) => ({ id: c.id, name: c.name }))}
        onClose={() => setCategoryModalOpen(false)}
        onSelect={handleSelectCategory}
      />

      <SelectionModal
        visible={isSubCategoryModalOpen}
        title="Select Sub Category"
        options={subCategories.map((s) => ({ id: s.id, name: s.name }))}
        onClose={() => setSubCategoryModalOpen(false)}
        onSelect={(opt) => setSelectedSubCategory(subCategories.find((s) => String(s.id) === String(opt.id)) || null)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: Spacing.six,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: AuthPalette.NAVY,
  },
  closeBtn: {
    padding: Spacing.one,
  },
  content: {
    padding: Spacing.four,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
  },
  applyButton: {
    backgroundColor: AuthPalette.NAVY,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.four,
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
