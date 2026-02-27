import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as ExpoSplash from "expo-splash-screen";
import React, { useEffect, useState } from 'react';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { KYCProvider } from './src/context/KYCContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { WalletProvider } from './src/context/WalletContext';
import { initializeI18n } from './src/i18n/index';
import { registerForPushNotificationsAsync } from "./src/services/pushClient";
import { connectSocket, joinUserRoom, onMinutesCredit } from "./src/services/realtime";
import { useUserStore } from "./src/store/useUserStore";

ExpoSplash.preventAutoHideAsync(); // ONCE, at top level



// Screens
import ATCPriceScreen from './src/screens/ATCPriceScreen';
import BiometricLoginScreen from './src/screens/BiometricLoginScreen';
import BuyUtilityScreen from './src/screens/BuyUtilityScreen';
import CallSessionScreen from './src/screens/CallSessionScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import ConvertHistoryScreen from './src/screens/ConvertHistoryScreen';
import ConvertScreen from './src/screens/ConvertScreen';
import ConvertSuccessScreen from './src/screens/ConvertSuccessScreen';
import DonateScreen from './src/screens/DonateScreen';
import EarnScreen from './src/screens/EarnScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import EmailVerificationScreen from './src/screens/EmailVerificationScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import InviteScreen from './src/screens/InviteScreen';
import KycCameraScreen from './src/screens/KycCameraScreen';
import KycCaptureIDScreen from "./src/screens/KycCaptureIDScreen";
import KycCaptureSelfieScreen from "./src/screens/KycCaptureSelfieScreen";
import KYCScreen from './src/screens/KYCScreen';
import KYCStatusScreen from './src/screens/KYCStatusScreen';
import LanguageScreen from './src/screens/LanguageScreen';
import LoginScreen from './src/screens/LoginScreen';
import LogoutScreen from './src/screens/LogoutScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import OtpVerificationScreen from './src/screens/OtpVerificationScreen';
import PreferenceScreen from './src/screens/PreferencesScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import AboutScreen from './src/screens/settings/AboutScreen';
import ConfirmPinScreen from './src/screens/settings/ConfirmPinScreen';
import DeviceManagerScreen from './src/screens/settings/DeviceManagerScreen';
import ManageWalletsScreen from './src/screens/settings/ManageWalletsScreen';
import SetPinScreen from './src/screens/settings/SetPinScreen';
import SettingsScreen from './src/screens/settings/SettingsScreen';
import SupportScreen from './src/screens/settings/SupportScreen';
import TermsScreen from './src/screens/settings/TermsScreen';
import WithdrawalPinScreen from './src/screens/settings/WithdrawalPinScreen';


import AppInfoScreen from './src/screens/settings/AppInfoScreen';
import PrivacyScreen from './src/screens/settings/PrivacyScreen';

import SupportChatScreen from './src/screens/settings/SupportChatScreen';
import SplashScreen from './src/screens/SplashScreen';
import SurveyScreen from './src/screens/SurveyScreen';
import ThemeScreen from './src/screens/ThemeScreen';
import UtilityHistoryScreen from "./src/screens/UtilityHistoryScreen";
import UtilitySuccessScreen from './src/screens/UtilitySuccessScreen';
import WithdrawHistoryScreen from './src/screens/WithdrawHistoryScreen';
import WithdrawPinScreen from './src/screens/WithdrawPinScreen';
import WithdrawScreen from './src/screens/WithdrawScreen';
import WithdrawSuccessScreen from './src/screens/WithdrawSuccessScreen';




import { default as AppDrawer, default as DrawerNavigator } from './src/navigation/DrawerNavigator';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { paperTheme, navigationTheme } = useTheme();

  const [isReady, setIsReady] = useState(false);
  const [isSplashing, setIsSplashing] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [isLanguageSelected, setIsLanguageSelected] = useState(false);
  const [showAppSplash, setShowAppSplash] = useState(true);

useEffect(() => {
  const init = async () => {
    // simulate app init
    await new Promise(r => setTimeout(r, 1500));

    const selectedLang = await AsyncStorage.getItem("selectedLanguage");
    setIsLanguageSelected(!!selectedLang);

    const onboarded = await AsyncStorage.getItem("hasOnboarded");
    setHasOnboarded(onboarded === "true");

    await initializeI18n();

    // 🔑 Hide native splash FIRST
    await ExpoSplash.hideAsync();

    // 🔑 Show animated splash briefly
    setTimeout(() => {
      setShowAppSplash(false);
      setIsReady(true);
    }, 1200);
  };

  init();
}, []);

  useEffect(() => {
    const init = async () => {
      await new Promise(r => setTimeout(r, 1500));

      const selectedLang = await AsyncStorage.getItem("selectedLanguage");
      setIsLanguageSelected(!!selectedLang);

      await initializeI18n();

      const onboarded = await AsyncStorage.getItem("hasOnboarded");
      setHasOnboarded(onboarded === "true");

      setIsSplashing(false);
      setIsReady(true);
    };

    init();
  }, []);

  if (!isReady || isSplashing) {
    return <SplashScreen />;
  }

  return (
        <SafeAreaProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={
          !isLanguageSelected ? "Language"
            : !hasOnboarded ? "Onboarding"
            : "Register"
        }>

          {/* Auth & Core */}
          <Stack.Screen name="Language" component={LanguageScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />

          {/* Main */}
          <Stack.Screen name="MainTabs" component={DrawerNavigator} />

          {/* KYC */}
          <Stack.Screen name="KYC" component={KYCScreen} />
          <Stack.Screen name="KYCStatus" component={KYCStatusScreen} />
          <Stack.Screen name="WithdrawalPin" component={WithdrawalPinScreen} />

          {/* Withdraw */}
          <Stack.Screen name="Withdraw" component={WithdrawScreen} />
          <Stack.Screen name="WithdrawPin" component={WithdrawPinScreen} />
          <Stack.Screen name="WithdrawSuccess" component={WithdrawSuccessScreen} />
          <Stack.Screen name="WithdrawHistory" component={WithdrawHistoryScreen} />

          {/* Convert */}
          <Stack.Screen name="Convert" component={ConvertScreen} />
          <Stack.Screen name="ConvertHistory" component={ConvertHistoryScreen} />

          {/* Other */}
          <Stack.Screen name="Earn" component={EarnScreen} />
          <Stack.Screen name="Donate" component={DonateScreen} />
          <Stack.Screen name="Survey" component={SurveyScreen} />
          <Stack.Screen name="Invite" component={InviteScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
          <Stack.Screen name="ManageWallets" component={ManageWalletsScreen} />
          <Stack.Screen name="BiometricLoginScreen" component={BiometricLoginScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Theme" component={ThemeScreen} />
          <Stack.Screen name="Terms" component={TermsScreen} />
          <Stack.Screen name="Support" component={SupportScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
          <Stack.Screen name="Privacy" component={PrivacyScreen} />
          <Stack.Screen name="Logout" component={LogoutScreen} />
          <Stack.Screen name="Preference" component={PreferenceScreen} />
          <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
          <Stack.Screen name="AppDrawer" component={AppDrawer} />
          <Stack.Screen name="KycCaptureID" component={KycCaptureIDScreen} />
          <Stack.Screen name="KycCaptureSelfie" component={KycCaptureSelfieScreen} /> 
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="CallSession" component={CallSessionScreen} />
          <Stack.Screen name="BuyUtility" component={BuyUtilityScreen} />
          <Stack.Screen name="ConvertSuccess" component={ConvertSuccessScreen} />
          <Stack.Screen name="UtilityHistory" component={UtilityHistoryScreen}/>
          <Stack.Screen name="KycCamera" component={KycCameraScreen}options={{ headerShown: false }}/>
          <Stack.Screen name="UtilitySuccess" component={UtilitySuccessScreen}/>
          <Stack.Screen name="ATCPrice" component={ATCPriceScreen}/>
          <Stack.Screen name="SetPin" component={SetPinScreen} />
          <Stack.Screen name="ConfirmPin" component={ConfirmPinScreen} />
          <Stack.Screen name="AppInfo" component={AppInfoScreen} />
          <Stack.Screen name="Devices"component={DeviceManagerScreen}/>
           <Stack.Screen name="SupportChat"component={SupportChatScreen}/>
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
   </GestureHandlerRootView>
    </SafeAreaProvider>
    
  );
}

// ---------------- BOOTSTRAP COMPONENT ----------------

function AppBootstrap() {
  const { setUser, fetchKyc, fetchPin, listenSocket } = useUserStore();

  useEffect(() => {
    const bootstrapRealtime = async () => {
      const id = await AsyncStorage.getItem("userId");

      if (id) {
        setUser(id);

        await fetchKyc();
        await fetchPin();

        listenSocket();
      }
    };

    bootstrapRealtime();
  }, []);

  useEffect(() => {
    (async () => {
      await registerForPushNotificationsAsync();

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: false
        }),
      });

      Notifications.addNotificationReceivedListener(notification => {
        console.log("Notification received", notification);
      });

      Notifications.addNotificationResponseReceivedListener(response => {
        console.log("Notification tapped", response);
      });
    })();
  }, []);

  useEffect(()=> {
  (async ()=>{
    const uid = await AsyncStorage.getItem("userId");
    connectSocket("https://api.airtimecoin.africa");
    if(uid) joinUserRoom(uid);
    onMinutesCredit(p => console.log("Realtime credit", p));
  })();
}, []);

  return null; // No UI needed
}
export default function App() {
  return (
          <WalletProvider>
    <ThemeProvider>
      <KYCProvider>
        <AppBootstrap />
        <RootNavigator />
      </KYCProvider>
    </ThemeProvider>
         </WalletProvider>
  );
}





