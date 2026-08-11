import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { TaskerTabBar } from '@/components/tasker/TaskerTabBar';
import type { TaskerStackParamList, TaskerTabParamList } from '@/navigation/types';
import { TaskerBiddingScreen } from '@/screens/tasker/bidding/TaskerBiddingScreen';
import { TaskerFindJobsScreen } from '@/screens/tasker/find-jobs/TaskerFindJobsScreen';
import { TaskerHistoryScreen } from '@/screens/tasker/history/TaskerHistoryScreen';
import { TaskerHomeScreen } from '@/screens/tasker/home/TaskerHomeScreen';
import { TaskerNotificationsScreen } from '@/screens/tasker/home/TaskerNotificationsScreen';
import { TaskerJobDetailsScreen } from '@/screens/tasker/job-details/TaskerJobDetailsScreen';
import { TaskerPlaceBidScreen } from '@/screens/tasker/job-details/TaskerPlaceBidScreen';
import { TaskerWalletScreen } from '@/screens/tasker/wallet/TaskerWalletScreen';
import { TaskerEditProfileScreen } from '../screens/tasker/profile/TaskerEditProfileScreen';
import { TaskerMyProfileScreen } from '../screens/tasker/profile/TaskerMyProfileScreen';
import { TaskerProfileScreen } from '../screens/tasker/profile/TaskerProfileScreen';
import { TaskerReviewsScreen } from '../screens/tasker/profile/TaskerReviewsScreen';
import { CustomerSupportScreen } from '@/screens/customer/profile/CustomerSupportScreen';
import { ChatScreen } from '@/screens/shared/ChatScreen';
import { LegalWebViewScreen } from '@/screens/shared/LegalWebViewScreen';

const Tab = createBottomTabNavigator<TaskerTabParamList>();
const Stack = createNativeStackNavigator<TaskerStackParamList>();

function TaskerTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TaskerTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tab.Screen name="TaskerHome" component={TaskerHomeScreen} />
      <Tab.Screen name="TaskerFindJobs" component={TaskerFindJobsScreen} />
      <Tab.Screen name="TaskerBidding" component={TaskerBiddingScreen} />
      <Tab.Screen name="TaskerHistory" component={TaskerHistoryScreen} />
    </Tab.Navigator>
  );
}

export function TaskerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TaskerTabs" component={TaskerTabNavigator} />
      <Stack.Screen name="TaskerJobDetails" component={TaskerJobDetailsScreen} />
      <Stack.Screen name="TaskerPlaceBid" component={TaskerPlaceBidScreen} />
      <Stack.Screen name="TaskerProfile" component={TaskerProfileScreen} />
      <Stack.Screen name="TaskerReviews" component={TaskerReviewsScreen} />
      <Stack.Screen name="TaskerMyProfile" component={TaskerMyProfileScreen} />
      <Stack.Screen name="TaskerEditProfile" component={TaskerEditProfileScreen} />
      <Stack.Screen name="TaskerNotifications" component={TaskerNotificationsScreen} />
      <Stack.Screen name="TaskerWallet" component={TaskerWalletScreen} />
      <Stack.Screen name="LegalWebView" component={LegalWebViewScreen} />
      <Stack.Screen name="TaskerSupport" component={CustomerSupportScreen} />
      <Stack.Screen name="TaskerChat" component={ChatScreen} />
    </Stack.Navigator>
  );
}
