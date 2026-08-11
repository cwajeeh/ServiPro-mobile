import Ionicons from 'react-native-vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity } from 'react-native';

import { Spacing, AuthPalette } from '@/constants/theme';

export function HomeSearchBar() {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          placeholder="Search"
          placeholderTextColor="#999"
          style={styles.input}
        />
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={20} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: Spacing.two,
    height: 50,
  },
  searchIcon: {
    marginRight: Spacing.one,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    padding: Spacing.one,
  },
});
