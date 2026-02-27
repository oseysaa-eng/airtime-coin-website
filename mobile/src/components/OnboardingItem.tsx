import React from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

interface OnboardingItemProps {
  item: {
    id: string;
    title: string;
    description: string;
    image: any;
  };
}

export const OnboardingItem: React.FC<OnboardingItemProps> = ({ item }) => (
  <View style={[styles.container, { width }]}>
    <Image source={item.image} style={styles.image} />
    <Text style={styles.title}>{item.title}</Text>
    <Text style={styles.description}>{item.description}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
    marginVertical: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
});
