import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

const ThemeScreen = () => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Theme</Text>
      <View style={styles.row}>
        <Text style={styles.label}>{darkMode ? 'Dark Mode' : 'Light Mode'}</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>
    </View>
  );
};

export default ThemeScreen;

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
