import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TwoFactorAuthScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Two-Factor Authentication (2FA)</Text>
      {/* Add toggle switch and setup instructions */}
    </View>
  );
};

export default TwoFactorAuthScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
