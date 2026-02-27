import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

const NotificationsScreen = () => {
  const [enabled, setEnabled] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Notifications</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Enable Notifications</Text>
        <Switch value={enabled} onValueChange={setEnabled} />
      </View>
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { fontSize: 16 },
});
