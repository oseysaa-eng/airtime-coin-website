import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import { auth } from "../firebase/firebaseConfig";

export default function EmailVerificationScreen({ navigation }) {
  const [checking, setChecking] = useState(false);

  const checkVerification = async () => {
    setChecking(true);
    await auth.currentUser.reload();
    if (auth.currentUser.emailVerified) {
      navigation.replace('MainTabs');
    } else {
      setChecking(false);
      alert('Email is still not verified. Please check your inbox.');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Please verify your email before continuing.</Text>
      {checking ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="I have verified" onPress={checkVerification} />
      )}
    </View>
  );
}
