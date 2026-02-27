// EarnHeader.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const EarnHeader = () => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.iconWrapper}>
        <FontAwesome5 name="coins" size={24} color="#fff" />
      </View>
      <View style={styles.textWrapper}>
        <Text style={styles.label}>Total Earnings</Text>
        <Text style={styles.amount}>₵15.20 ATC</Text>
      </View>
    </View>
  );
};

export default EarnHeader;

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#5A55CA',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  iconWrapper: {
    backgroundColor: '#4A46B4',
    padding: 12,
    borderRadius: 50,
    marginRight: 16,
  },
  textWrapper: {
    flex: 1,
  },
  label: {
    color: '#ddd',
    fontSize: 14,
    marginBottom: 4,
  },
  amount: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
