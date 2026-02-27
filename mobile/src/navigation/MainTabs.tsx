// src/navigation/MainTabs.tsx
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

import DonateScreen from "../screens/DonateScreen";
import HomeScreen from "../screens/HomeScreen";
import StakingScreen from "../screens/StakingScreen";
import SurveyScreen from "../screens/SurveyScreen";
import WithdrawScreen from "../screens/WithdrawScreen";

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0ea5a4',
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Donate') iconName = 'heart';
          else if (route.name === 'Staking') iconName = 'stats-chart-outline';
          else if (route.name === 'Survey') iconName = 'book-outline';
          else if (route.name === "Withdraw") iconName = "wallet-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Staking" component={StakingScreen} />
      <Tab.Screen name="Donate" component={DonateScreen} />
     <Tab.Screen name="Withdraw" component={WithdrawScreen} />
      <Tab.Screen name="Survay" component={SurveyScreen} />
    </Tab.Navigator>
  );
};

export default MainTabs;
