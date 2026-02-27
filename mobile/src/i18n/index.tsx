import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import language files (TypeScript modules)
import en from '../locales/en';
import fr from '../locales/fr';
import tw from '../locales/tw';
import ha from '../locales/ha';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  tw: { translation: tw },
  ha: { translation: ha },
};

// This function sets up i18n with the stored or default language
export const initializeI18n = async () => {
  const storedLanguage = await AsyncStorage.getItem('selectedLanguage');
  const fallbackLng = storedLanguage || 'en';

  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: fallbackLng,
      fallbackLng: 'en',
      compatibilityJSON: 'v3',
      interpolation: {
        escapeValue: false,
      },
    });
};

// This function lets you switch language manually and saves it
export const setAppLanguage = async (lang: string) => {
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem('selectedLanguage', lang);
};

export default i18n;
