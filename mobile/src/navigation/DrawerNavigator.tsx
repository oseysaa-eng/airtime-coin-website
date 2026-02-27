import { createDrawerNavigator } from "@react-navigation/drawer";
import React from "react";
import CustomDrawerContent from "../components/CustomDrawerContent";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import TabNavigator from "./TabNavigator"; // <-- BOTTOM TABS


const Drawer = createDrawerNavigator();

export default function AppDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: "front",
        drawerStyle: { width: 260 },
      }}
    >
      {/* IMPORTANT: Home now loads BottomTabs */}
      <Drawer.Screen name="Dashboard" component={TabNavigator} />
        <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}


