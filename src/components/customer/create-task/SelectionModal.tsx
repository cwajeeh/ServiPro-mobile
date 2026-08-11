import Ionicons from 'react-native-vector-icons/Ionicons';
import React from 'react';
import { FlatList, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AuthPalette, Spacing } from '@/constants/theme';

export interface SelectionOption {
  id: string | number;
  name: string;
}

interface SelectionModalProps {
  visible: boolean;
  options: SelectionOption[];
  onSelect: (option: SelectionOption) => void;
  onClose: () => void;
  title: string;
}

export function SelectionModal({ visible, options, onSelect, onClose, title }: SelectionModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <ThemedText style={styles.optionText}>{item.name}</ThemedText>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </View>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    minHeight: 300,
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
    fontSize: 18,
    fontWeight: '600',
    color: AuthPalette.NAVY,
  },
  closeBtn: {
    padding: Spacing.one,
  },
  listContent: {
    paddingBottom: Spacing.six,
  },
  optionItem: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
});
