import Ionicons from 'react-native-vector-icons/Ionicons';
import { RouteProp, useRoute } from '@react-navigation/native';
import { StatusBar } from '@/components/shared/RnStatusBar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchServiceSubcategories } from '@/api/services';
import { AuthPalette, Spacing } from '@/constants/theme';
import { useCustomerTabNavigation } from '@/navigation/hooks';
import type { CustomerTabParamList } from '@/navigation/types';
import type { ServiceSubcategory } from '@/types/services';
import { logUnexpectedError } from '@/utils/devLog';
import { getMediaBaseUrl } from '@/utils/mediaUrl';

const { NAVY, PRIMARY_TEXT, BORDER } = AuthPalette;

const resolveImageUrl = (path?: string | null) => {
  if (!path) return undefined;
  if (path.startsWith('http') || path.startsWith('data:')) return path;

  const baseUrl = getMediaBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl.replace(/\/$/, '')}${cleanPath}`;
};

export function SubCategoriesScreen() {
  const navigation = useCustomerTabNavigation();
  const route = useRoute<RouteProp<CustomerTabParamList, 'CustomerSubCategories'>>();
  const { categoryId, categoryName } = route.params;

  const [subCategories, setSubCategories] = useState<ServiceSubcategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchServiceSubcategories(categoryId)
      .then((data) => setSubCategories(data))
      .catch((err) => logUnexpectedError('fetchServiceSubcategories', err))
      .finally(() => setLoading(false));
  }, [categoryId]);

  const filteredSubCategories = subCategories.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Curved Header */}
      <View style={styles.headerContainer}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            {isSearching ? (
              <View style={styles.searchBarWrapper}>
                <Ionicons name="search" size={20} color="rgba(255, 255, 255, 0.7)" style={styles.searchBarIcon} />
                <TextInput
                  style={styles.searchBarInput}
                  placeholder="Search for a service"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
                <TouchableOpacity onPress={() => { setIsSearching(false); setSearchQuery(''); }}>
                  <Ionicons name="close" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                >
                  <Ionicons name="chevron-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <View style={{ flex: 1, marginHorizontal: Spacing.two }}>
                  <Text style={styles.headerTitle} numberOfLines={1}>{categoryName}</Text>
                </View>
                <TouchableOpacity style={styles.searchButton} onPress={() => setIsSearching(true)}>
                  <Ionicons name="search" size={24} color="#FFF" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </SafeAreaView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={NAVY} style={{ marginVertical: 40 }} />
      ) : (
        <FlatList
          data={filteredSubCategories}
          keyExtractor={(item, index) => `subcategory-${item.id}-${index}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 40, color: '#64748B' }}>
              No subcategories found.
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => navigation.navigate('CustomerServiceDetails', {
                subCategoryId: item.id,
                subCategoryName: item.name
              })}
            >
              {resolveImageUrl(item.icon) ? (
                <View style={[styles.cardImage, item.backgroundColor ? { backgroundColor: item.backgroundColor } : { backgroundColor: '#F1F5F9' }]}>
                  <Image
                    source={{ uri: resolveImageUrl(item.icon) }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </View>
              ) : (
                <View style={[styles.cardImage, { backgroundColor: item.backgroundColor || '#F1F5F9', alignItems: 'center', justifyContent: 'center' }]}>
                  <Ionicons name="construct-outline" size={30} color={NAVY} />
                </View>
              )}

              <View style={styles.cardInfo}>
                <View style={styles.leftInfo}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.cardPros}>Available Professionals: {item.taskerCount || 0}</Text>
                </View>

                <View style={styles.rightInfo}>
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Starting From</Text>
                    <Text style={styles.priceValue}>£{item.startingPrice || 0}/hr</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#CBD5E1" style={{ marginLeft: 8 }} />
                </View>
              </View>
            </Pressable>
          )}
        />
      )}

      {/* Bottom Padding for Tab Bar */}
      <View style={{ height: 100 }} />
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.two,
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
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
    paddingHorizontal: Spacing.three,
    height: 44,
  },
  searchBarIcon: {
    marginRight: Spacing.two,
  },
  searchBarInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    paddingVertical: 0,
  },
  listContent: {
    padding: Spacing.four,
    paddingTop: Spacing.six,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
    overflow: 'hidden',
  },
  cardInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftInfo: {
    flex: 1,
    marginRight: 8,
  },
  rightInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1E2939',
    marginBottom: 2,
  },
  cardPros: {
    fontSize: 13,
    color: '#64748B',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 11,
    color: NAVY,
    fontWeight: '500',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 18,
    color: NAVY,
    fontWeight: '700',
  },
});
