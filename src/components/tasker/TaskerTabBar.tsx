import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { Spacing, TaskerPalette } from '@/constants/theme';

const { TAB_ACTIVE, TAB_INACTIVE } = TaskerPalette;
const ICON_SIZE = 24;

export function TaskerTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

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

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={styles.tabItem}>
              <View style={[styles.iconContainer, isFocused && styles.activeIconWrap]}>
                <Icon
                  name={route.name}
                  color={isFocused ? (isFocused ? '#FFF' : TAB_ACTIVE) : TAB_INACTIVE}
                  isFocused={isFocused}
                />
              </View>
              <Text style={[styles.label, { color: isFocused ? TAB_ACTIVE : TAB_INACTIVE }]}>
                {getSafeLabel(label.toString())}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function getSafeLabel(name: string) {
  if (name.toLowerCase().includes('home')) return 'Home';
  if (name.toLowerCase().includes('find')) return 'Find Jobs';
  if (name.toLowerCase().includes('bidding')) return 'Bidding';
  if (name.toLowerCase().includes('history')) return 'History';
  return name;
}

function Icon({ name, color, isFocused }: { name: string; color: string; isFocused: boolean }) {
  const iconColor = isFocused ? '#FFF' : TAB_INACTIVE;

  if (name === 'TaskerHome') {
    return (
      <Image
        source={require('../../../assets/taskBarIcons/HomeOutline.png')}
        style={{ width: ICON_SIZE, height: ICON_SIZE, tintColor: iconColor }}
      />
    );
  }
  if (name === 'TaskerFindJobs') {
    return (
      <Image
        source={isFocused
          ? require('../../../assets/taskBarIcons/search.png')
          : require('../../../assets/taskBarIcons/searchOutline.png')
        }
        style={{ width: ICON_SIZE, height: ICON_SIZE, tintColor: iconColor }}
      />
    );
  }
  if (name === 'TaskerBidding') {
    return (
      <Image
        source={isFocused
          ? require('../../../assets/taskBarIcons/bidding.png')
          : require('../../../assets/taskBarIcons/biddingOutline.png')
        }
        style={{ width: ICON_SIZE, height: ICON_SIZE, tintColor: iconColor }}
      />
    );
  }
  if (name === 'TaskerHistory') {
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        {/* Calendar body */}
        <Rect x="3" y="4" width="18" height="17" rx="2" stroke={iconColor} strokeWidth="2" />
        <Path d="M3 10h18" stroke={iconColor} strokeWidth="2" />
        {/* Grid lines */}
        <Path d="M7 13v1M12 13v1M17 13v1M7 17v1" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" />
        {/* Checkmark in one box */}
        <Path d="M11.5 17.5l1.5 1.5 3-3" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Top rings */}
        <Path d="M8 2v4M16 2v4" stroke={iconColor} strokeWidth="2" strokeLinecap="round" />
      </Svg>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: '#F8FAFC',
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingBottom: Spacing.four,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    justifyContent: 'space-around',
    height: 85,
    // Shadow for the tab bar
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    paddingBottom: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  activeIconWrap: {
    backgroundColor: TAB_ACTIVE,
    width: 62,
    height: 62,
    borderRadius: 31,
    marginTop: -45, // Floating effect
    // Shadow for the floating circle
    shadowColor: TAB_ACTIVE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
  },
});

