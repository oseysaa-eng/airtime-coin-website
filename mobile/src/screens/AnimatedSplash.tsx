// screens/AnimatedSplash.tsx

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ImageSourcePropType } from 'react-native';

type Props = {
  navigation: {
    replace: (screen: string) => void;
  };
};

const AnimatedSplash: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        navigation.replace('Onboarding'); // Change to 'Login' if needed
      }, 800);
    });
  }, [fadeAnim, navigation]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../assets/logo.png')} // Make sure the path is correct
        style={[styles.logo, { opacity: fadeAnim }]}
        resizeMode="contain"
      />
    </View>
  );
};

export default AnimatedSplash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
});
