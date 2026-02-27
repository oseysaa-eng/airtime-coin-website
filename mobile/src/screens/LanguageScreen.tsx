import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { setAppLanguage } from '../i18n';

const { width } = Dimensions.get('window');

const languageOptions = [
  { code: 'en', name: 'English', flag: require('../assets/flags/en.png') },
  { code: 'tw', name: 'Twi', flag: require('../assets/flags/tw.png') },
  { code: 'fr', name: 'Français', flag: require('../assets/flags/fr.png') },
  { code: 'ha', name: 'Hausa', flag: require('../assets/flags/ha.png') },
];

const LanguageScreen = () => {
  const [selectedLang, setSelectedLang] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const scheme = useColorScheme();
  const { t } = useTranslation();

  const themeStyles = {
    backgroundColor: scheme === 'dark' ? '#121212' : '#ffffff',
    textColor: scheme === 'dark' ? '#ffffff' : '#000000',
    accent: '#0ea5a4',
  };

  useEffect(() => {
    const loadStoredLang = async () => {
      const storedCode = await AsyncStorage.getItem('selectedLanguage');
      const stored = languageOptions.find(l => l.code === storedCode);
      if (stored) setSelectedLang(stored);
    };
    loadStoredLang();
  }, []);

  const handleSelectLanguage = async (lang: any) => {
    setSelectedLang(lang);
    await AsyncStorage.setItem('selectedLanguage', lang.code);
    await setAppLanguage(lang.code);
    setModalVisible(false);
  };

  const handleContinue = () => {
    if (!selectedLang) return;
    navigation.replace('Onboarding');
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.optionItem}
      onPress={() => handleSelectLanguage(item)}
    >
      <Image source={item.flag} style={styles.flagIcon} />
      <Text style={[styles.optionText, { color: themeStyles.textColor }]}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
      <Text style={[styles.title, { color: themeStyles.textColor }]}>
        {t('select_language')}
      </Text>
      <Text style={[styles.subtitle, { color: themeStyles.textColor }]}>
        {t('choose_language')}
      </Text>

      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setModalVisible(true)}
      >
        {selectedLang ? (
          <>
            <Image source={selectedLang.flag} style={styles.flagIcon} />
            <Text style={[styles.selectedText, { color: themeStyles.textColor }]}>
              {selectedLang.name}
            </Text>
          </>
        ) : (
          <Text style={[styles.placeholderText, { color: '#999' }]}>
            Select a language...
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleContinue}
        style={[
          styles.continueBtn,
          { backgroundColor: selectedLang ? themeStyles.accent : '#ccc' },
        ]}
        disabled={!selectedLang}
      >
        <Text style={styles.continueText}>{t('continue')}</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <View style={[styles.modalContainer, { backgroundColor: themeStyles.backgroundColor }]}>
            <FlatList
              data={languageOptions}
              renderItem={renderItem}
              keyExtractor={(item) => item.code}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default LanguageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 30, textAlign: 'center' },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 14,
    width: '100%',
    marginBottom: 20,
  },
  selectedText: { fontSize: 16, marginLeft: 10 },
  placeholderText: { fontSize: 16 },
  flagIcon: { width: 28, height: 20, resizeMode: 'contain' },
  continueBtn: {
    marginTop: 30,
    width: width * 0.7,
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  continueText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#00000055',
  },
  modalContainer: {
    maxHeight: 300,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 10,
  },
});
