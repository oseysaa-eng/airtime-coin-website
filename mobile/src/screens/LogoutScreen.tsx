// screens/LogoutScreen.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { disconnectSocket } from "../services/realtime";

const LogoutScreen = () => {
  const navigation = useNavigation();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const themeStyles = {
    backgroundColor: isDark ? '#121212' : '#ffffff',
    textColor: isDark ? '#fff' : '#000',
    buttonColor: isDark ? '#ff4d4d' : '#d00000',
    cancelColor: isDark ? '#ccc' : '#444',
  };

  const handleLogout = async () => {
  Alert.alert(
    'Confirm Logout',
    'Are you sure you want to logout?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            // 🔥 Clear storage
            await AsyncStorage.multiRemove([
              "token",
              "userId",
              "userEmail"
            ]);

            // 🔌 Disconnect realtime
            disconnectSocket();

            // 🧠 Reset state
            setUser(null);

            // 🔄 Reset navigation
            navigation.reset({
              index: 0,
              routes: [{ name: "Register" }],
            });

          } catch (e) {
            console.error('Logout error:', e);
          }
        },
      },
    ],
    { cancelable: true }
  );
};


  return (
    <View style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
      <Text style={[styles.title, { color: themeStyles.textColor }]}>Logout</Text>
      <Text style={[styles.message, { color: themeStyles.textColor }]}>
        Logging out will end your current session. You’ll need to log in again to use the app.
      </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: themeStyles.buttonColor }]}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Confirm Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.cancelButton}
      >
        <Text style={[styles.cancelText, { color: themeStyles.cancelColor }]}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};


export default LogoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    marginBottom: 30,
  },
  button: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
