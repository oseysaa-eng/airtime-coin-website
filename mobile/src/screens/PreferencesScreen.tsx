import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { Picker } from '@react-native-picker/picker';
import { setAppLanguage } from '../i18n';

const languages = [
  { label: 'English', value: 'en' },
  { label: 'French', value: 'fr' },
  { label: 'Twi', value: 'tw' },
  { label: 'Hausa', value: 'ha' },
];

const PreferenceScreen = () => {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    (async () => {
      const storedLang = await AsyncStorage.getItem('selectedLanguage');
      if (storedLang) setSelectedLanguage(storedLang);

      const storedTheme = await AsyncStorage.getItem('isDarkMode');
      if (storedTheme) setIsDarkMode(storedTheme === 'true');
    })();
  }, []);

  const handleLanguageChange = async (lang: string) => {
    setSelectedLanguage(lang);
    await setAppLanguage(lang);
  };

  const toggleTheme = async () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    await AsyncStorage.setItem('isDarkMode', newValue.toString());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Language</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedLanguage}
          onValueChange={handleLanguageChange}
          style={styles.picker}
        >
          {languages.map(lang => (
            <Picker.Item key={lang.value} label={lang.label} value={lang.value} />
          ))}
        </Picker>
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.title}>Dark Mode</Text>
        <Switch value={isDarkMode} onValueChange={toggleTheme} />
      </View>
    </View>
  );
};

export default PreferenceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: '600',
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ccc',
    marginBottom: 20,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
});
