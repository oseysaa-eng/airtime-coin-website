import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { RootStackParamList } from "../types";

// SCREENS
import HomeScreen from "../screens/HomeScreen";
import KycStartScreen from "../screens/KycStartScreen";
import KycSubmitScreen from "../screens/KycSubmitScreen";
import LoginScreen from "../screens/LoginScreen";
import ProfileScreen from "../screens/ProfileScreen";
import RegisterScreen from "../screens/RegisterScreen";
import StakeDetailsScreen from "../screens/StakeDetailsScreen";
import StakingScreen from "../screens/StakingScreen";

import WithdrawScreen from "../screens/WithdrawScreen";



const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {/* AUTH */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* HOME */}
        <Stack.Screen name="Home" component={HomeScreen} />

        {/* PROFILE */}
        <Stack.Screen name="Profile" component={ProfileScreen} />

        {/* KYC */}
        <Stack.Screen name="KycStart" component={KycStartScreen} />
        <Stack.Screen name="KycSubmit" component={KycSubmitScreen} />

        {/* WITHDRAW STACK */}
        <Stack.Screen name="Withdraw" component={WithdrawScreen} />

        {/* STAKING STACK */}
        <Stack.Screen name="Staking" component={StakingScreen} />
        <Stack.Screen name="StakeDetails" component={StakeDetailsScreen} />

        <Stack.Screen name="KycStart"component={KycStartScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="KycSubmit"component={KycSubmitScreen} options={{ headerShown: false }}/>
       
   

      </Stack.Navigator>
    </NavigationContainer>
  );
}


