import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { ComponentProps } from 'react';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AuthPalette } from '@/constants/theme';

type TabIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export function CustomCustomerTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const currentRouteName = state.routes[state.index].name;
  const hiddenRoutes = [
    'CustomerAddCards', 'CustomerWallet', 'CustomerReviews', 'CustomerSupport',
    'CustomerReferral', 'CustomerOrderHistory', 'CustomerNotifications',
    'CustomerAllServices', 'CustomerPopularServices', 'CustomerSubCategories',
    'CustomerServiceDetails', 'CustomerProfile', 'CustomerMyProfile',
    'CustomerProviderDetails', 'CustomerMatching', 'CustomerPendingTask',
    'CustomerHireProfessional', 'CustomerTaskDetail', 'CustomerBookingDetail'
  ];

  if (hiddenRoutes.includes(currentRouteName)) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabBarWrapper}>
        {state.routes
          .filter(route => !hiddenRoutes.includes(route.name))
          .map((route) => {
            const index = state.routes.findIndex(r => r.key === route.key);
            const { options } = descriptors[route.key];

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            if (route.name === 'CustomerCreateTask') {
              return (
                <TouchableOpacity
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={styles.centerButtonContainer}
                >
                  <View style={styles.centerButton}>
                    <MaterialCommunityIcons name="plus" size={32} color="#FFF" />
                  </View>
                </TouchableOpacity>
              );
            }

            let iconName: TabIconName = 'help-circle-outline';
            let labelText = '';

            if (route.name === 'CustomerHome') {
              iconName = isFocused ? 'home' : 'home-outline';
              labelText = 'Home';
            } else if (route.name === 'CustomerFindPro') {
              iconName = isFocused ? 'account-search' : 'account-search-outline';
              labelText = 'Find Pro';
            } else if (route.name === 'CustomerBidding') {
              iconName = 'gavel';
              labelText = 'Bidding';
            } else if (route.name === 'CustomerBookings') {
              iconName = isFocused ? 'calendar-check' : 'calendar-check-outline';
              labelText = 'Bookings';
            }

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabItem}
              >
                <MaterialCommunityIcons
                  name={iconName}
                  size={24}
                  color={isFocused ? AuthPalette.NAVY : '#94A3B8'}
                />
                <ThemedText style={[styles.tabLabel, isFocused && styles.activeTabLabel]}>
                  {labelText}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    elevation: 0,
  },
  tabBarWrapper: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: 90,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    color: '#94A3B8',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: AuthPalette.NAVY,
    fontWeight: '500',
  },
  centerButtonContainer: {
    top: -30, // Raise the button
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: 70,
    zIndex: 10,
  },
  centerButton: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: AuthPalette.NAVY,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: '#F0F4FF', // Light blue/border color from design
    shadowColor: AuthPalette.NAVY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
});
