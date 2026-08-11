import Ionicons from 'react-native-vector-icons/Ionicons';
import { StatusBar } from '@/components/shared/RnStatusBar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchServiceCategories } from '@/api/services';
import { AuthPalette, Spacing } from '@/constants/theme';
import { useCustomerTabNavigation } from '@/navigation/hooks';
import type { ServiceCategory } from '@/types/services';
import { logUnexpectedError } from '@/utils/devLog';
import { getMediaBaseUrl } from '@/utils/mediaUrl';

const { NAVY, PRIMARY_TEXT, BORDER, MAIN_BLUE } = AuthPalette;

const resolveImageUrl = (path?: string | null) => {
  if (!path) return undefined;
  if (path.startsWith('http') || path.startsWith('data:')) return path;

  const baseUrl = getMediaBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl.replace(/\/$/, '')}${cleanPath}`;
};

export function AllServicesScreen() {
  const navigation = useCustomerTabNavigation();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchServiceCategories()
      .then((data) => setCategories(data))
      .catch((err) => logUnexpectedError('fetchServiceCategories', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                  <Ionicons name="chevron-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Text style={styles.headerTitle}>Services</Text>
                </View>
                <TouchableOpacity style={styles.searchButton} onPress={() => setIsSearching(true)}>
                  <Ionicons name="search" size={24} color="#FFF" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.content}>

        {loading ? (
          <ActivityIndicator size="large" color={NAVY} style={{ marginVertical: 40 }} />
        ) : (
          <FlatList
            data={filteredCategories}
            keyExtractor={(i) => i.id}
            numColumns={3}
            contentContainerStyle={styles.gridContent}
            columnWrapperStyle={styles.rowWrapper}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.categoryCard, item.backgroundColor ? { backgroundColor: item.backgroundColor } : undefined]}
                onPress={() => {
                  navigation.navigate('CustomerSubCategories', {
                    categoryId: item.id,
                    categoryName: item.name
                  });
                }}>
                {resolveImageUrl(item.icon) ? (
                  <View style={styles.iconWrapper}>
                    <Image source={{ uri: resolveImageUrl(item.icon) }} style={styles.listImage} resizeMode="contain" />
                  </View>
                ) : (
                  <Text style={styles.iconText}>📋</Text>
                )}
                <Text style={styles.categoryLabel} numberOfLines={2}>
                  {item.name}
                </Text>
              </Pressable>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF'
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

  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  gridContent: {
    paddingBottom: 100, // Space for Bottom Bar
  },
  rowWrapper: {
    justifyContent: 'flex-start',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  categoryCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.two,
  },
  iconText: {
    fontSize: 28,
    marginBottom: Spacing.two,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    marginBottom: Spacing.two,
  },
  listImage: {
    width: '100%',
    height: '100%',
  },
  categoryLabel: {
    fontSize: 11,
    textAlign: 'center',
    color: PRIMARY_TEXT,
    fontWeight: '500',
  },
});
