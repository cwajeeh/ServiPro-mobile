import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { CustomCustomerTabBar } from '@/components/customer/CustomCustomerTabBar';
import type { CustomerRootParamList, CustomerTabParamList } from '@/navigation/types';
import { BiddingScreen } from '@/screens/customer/bidding/BiddingScreen';
import { BookingsScreen } from '@/screens/customer/bookings/BookingsScreen';
import { CustomerTaskDetailScreen } from '@/screens/customer/bookings/CustomerTaskDetailScreen';
import { TaskDetailScreen } from '@/screens/customer/bookings/TaskDetailScreen';
import { CreateTaskScreen } from '@/screens/customer/create-task/CreateTaskScreen';
import { MatchingScreen } from '@/screens/customer/create-task/MatchingScreen';
import { PendingTaskScreen } from '@/screens/customer/create-task/PendingTaskScreen';
import { CustomerProviderDetailsScreen } from '@/screens/customer/find-pro/CustomerProviderDetailsScreen';
import { FindProScreen } from '@/screens/customer/find-pro/FindProScreen';
import { HireProfessionalScreen } from '@/screens/customer/find-pro/HireProfessionalScreen';
import { CustomerOrderHistoryScreen } from '@/screens/customer/history/CustomerOrderHistoryScreen';
import { CustomerNotificationsScreen } from '@/screens/customer/home/CustomerNotificationsScreen';
import { HomeScreen } from '@/screens/customer/home/HomeScreen';
import { CustomerMyProfileScreen } from '@/screens/customer/profile/CustomerMyProfileScreen';
import { CustomerProfileScreen } from '@/screens/customer/profile/CustomerProfileScreen';
import { CustomerReferralScreen } from '@/screens/customer/profile/CustomerReferralScreen';
import { CustomerReviewsScreen } from '@/screens/customer/profile/CustomerReviewsScreen';
import { CustomerSupportScreen } from '@/screens/customer/profile/CustomerSupportScreen';
import { AllServicesScreen } from '@/screens/customer/services/AllServicesScreen';
import { PopularServicesScreen } from '@/screens/customer/services/PopularServicesScreen';
import { ServiceDetailsScreen } from '@/screens/customer/services/ServiceDetailsScreen';
import { SubCategoriesScreen } from '@/screens/customer/services/SubCategoriesScreen';
import { CustomerAddCardsScreen } from '@/screens/customer/wallet/CustomerAddCardsScreen';
import { CustomerWalletScreen } from '@/screens/customer/wallet/CustomerWalletScreen';
import { ChatScreen } from '@/screens/shared/ChatScreen';
import { LegalWebViewScreen } from '@/screens/shared/LegalWebViewScreen';

const Tab = createBottomTabNavigator<CustomerTabParamList>();
const RootStack = createNativeStackNavigator<CustomerRootParamList>();

function CustomerTabsNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomCustomerTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen name="CustomerHome" component={HomeScreen} />
      <Tab.Screen name="CustomerNotifications" component={CustomerNotificationsScreen} />
      <Tab.Screen name="CustomerFindPro" component={FindProScreen} />
      <Tab.Screen name="CustomerProviderDetails" component={CustomerProviderDetailsScreen} />
      <Tab.Screen
        name="CustomerCreateTask"
        component={CreateTaskScreen}
        options={{ title: 'Create Task' }}
      />
      <Tab.Screen name="CustomerBidding" component={BiddingScreen} />
      <Tab.Screen name="CustomerBookings" component={BookingsScreen} />
      <Tab.Screen name="CustomerAllServices" component={AllServicesScreen} />
      <Tab.Screen name="CustomerPopularServices" component={PopularServicesScreen} />
      <Tab.Screen name="CustomerSubCategories" component={SubCategoriesScreen} />
      <Tab.Screen name="CustomerServiceDetails" component={ServiceDetailsScreen} />
      <Tab.Screen name="CustomerProfile" component={CustomerProfileScreen} />
      <Tab.Screen name="CustomerMyProfile" component={CustomerMyProfileScreen} />
      <Tab.Screen name="CustomerOrderHistory" component={CustomerOrderHistoryScreen} />
      <Tab.Screen name="CustomerReviews" component={CustomerReviewsScreen} />
      <Tab.Screen name="CustomerSupport" component={CustomerSupportScreen} />
      <Tab.Screen name="CustomerReferral" component={CustomerReferralScreen} />
      <Tab.Screen name="CustomerWallet" component={CustomerWalletScreen} />
      <Tab.Screen name="CustomerAddCards" component={CustomerAddCardsScreen} />

      <Tab.Screen
        name="CustomerMatching"
        component={MatchingScreen}
        options={{ tabBarStyle: { display: 'none' } }}
      />
      <Tab.Screen
        name="CustomerPendingTask"
        component={PendingTaskScreen}
        options={{ tabBarStyle: { display: 'none' } }}
      />
      <Tab.Screen name="CustomerHireProfessional" component={HireProfessionalScreen} />
      <Tab.Screen name="CustomerTaskDetail" component={CustomerTaskDetailScreen} />
      <Tab.Screen name="CustomerBookingDetail" component={TaskDetailScreen} />
      <Tab.Screen name="CustomerChat" component={ChatScreen} />
    </Tab.Navigator>
  );
}

export function CustomerStack() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="CustomerTabs" component={CustomerTabsNavigator} />
      <RootStack.Screen name="LegalWebView" component={LegalWebViewScreen} />
    </RootStack.Navigator>
  );
}
