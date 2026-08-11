import React, { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, PanResponder, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AuthPalette, Spacing } from '@/constants/theme';

interface PriceRangeSliderProps {
  min?: number;
  max?: number;
  initialLow?: number;
  initialHigh?: number;
  onValueChange?: (low: number, high: number) => void;
}

export function PriceRangeSlider({
  min = 0,
  max = 100,
  initialLow = 16,
  initialHigh = 56,
  onValueChange,
}: PriceRangeSliderProps) {
  const [low, setLow] = useState(initialLow);
  const [high, setHigh] = useState(initialHigh);
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    setLow(initialLow);
    setHigh(initialHigh);
  }, [initialLow, initialHigh]);

  const onLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  const getPositionFromValue = (value: number) => {
    if (trackWidth === 0) return 0;
    return ((value - min) / (max - min)) * trackWidth;
  };

  const getValueFromPosition = (position: number) => {
    if (trackWidth === 0) return min;
    const value = Math.round((position / trackWidth) * (max - min) + min);
    return Math.max(min, Math.min(max, value));
  };

  const lowStartPos = useRef(0);
  const highStartPos = useRef(0);

  const panResponderLow = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        lowStartPos.current = getPositionFromValue(low);
      },
      onPanResponderMove: (_, gestureState) => {
        const newPos = lowStartPos.current + gestureState.dx;
        const newValue = getValueFromPosition(newPos);
        if (newValue < high) {
          setLow(newValue);
          onValueChange?.(newValue, high);
        }
      },
    })
  ).current;

  const panResponderHigh = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        highStartPos.current = getPositionFromValue(high);
      },
      onPanResponderMove: (_, gestureState) => {
        const newPos = highStartPos.current + gestureState.dx;
        const newValue = getValueFromPosition(newPos);
        if (newValue > low) {
          setHigh(newValue);
          onValueChange?.(low, newValue);
        }
      },
    })
  ).current;

  const lowPos = getPositionFromValue(low);
  const highPos = getPositionFromValue(high);

  return (
    <View style={styles.container}>
      <View style={styles.sliderTrack} onLayout={onLayout}>
        {/* Active Track */}
        <View
          style={[
            styles.activeTrack,
            { left: lowPos, width: highPos - lowPos }
          ]}
        />

        {/* Left Handle */}
        <View
          style={[styles.handle, { left: lowPos }]}
          {...panResponderLow.panHandlers}
        >
          <View style={styles.priceLabel}>
            <ThemedText style={styles.priceLabelText}>£{low}</ThemedText>
          </View>
        </View>

        {/* Right Handle */}
        <View
          style={[styles.handle, { left: highPos }]}
          {...panResponderHigh.panHandlers}
        >
          <View style={styles.priceLabel}>
            <ThemedText style={styles.priceLabelText}>£{high}</ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40, // Space for labels
    paddingBottom: Spacing.four,
    paddingHorizontal: Spacing.two,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'center',
  },
  activeTrack: {
    position: 'absolute',
    height: 6,
    backgroundColor: AuthPalette.NAVY,
    borderRadius: 3,
  },
  handle: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: AuthPalette.NAVY,
    top: -10,
    marginLeft: -12,
    // Add hitSlop for easier dragging
    zIndex: 10,
  },
  priceLabel: {
    position: 'absolute',
    top: -30,
    left: -12,
    backgroundColor: AuthPalette.NAVY,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 40,
    alignItems: 'center',
  },
  priceLabelText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
