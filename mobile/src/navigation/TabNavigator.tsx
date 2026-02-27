import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";


import DonateScreen from "../screens/DonateScreen";
import EarnScreen from "../screens/EarnScreen";
import HomeScreen from "../screens/HomeScreen";
import StakingScreen from "../screens/StakingScreen";
import WithdrawScreen from "../screens/WithdrawScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let icon = "home";

          if (route.name === "Home") icon = "home";
          if (route.name === "Donate") icon = "heart";
          if (route.name === "Staking") icon = "stats-chart-outline";
          if (route.name === "Withdraw") icon = "wallet-outline";
          if (route.name === "Earn") icon = "cash-outline";

          return <Ionicons name={icon as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#0ea5a4",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Staking" component={StakingScreen} />
      <Tab.Screen name="Donate" component={DonateScreen} />
      <Tab.Screen name="Withdraw" component={WithdrawScreen} />
      <Tab.Screen name="Earn" component={EarnScreen} />
    </Tab.Navigator>
  );
}
