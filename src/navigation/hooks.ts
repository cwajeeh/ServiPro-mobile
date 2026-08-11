import type { CompositeNavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { CustomerRootParamList, CustomerTabParamList } from '@/navigation/types';

export type CustomerCompositeNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<CustomerTabParamList>,
  NativeStackNavigationProp<CustomerRootParamList>
>;

/** Typed navigation for customer tab screens (includes root stack routes such as `LegalWebView`). */
export function useCustomerTabNavigation() {
  return useNavigation<CustomerCompositeNavigation>();
}
