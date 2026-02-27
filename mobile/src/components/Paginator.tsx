import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface PaginatorProps {
  data: any[];
  scrollX: Animated.Value;
}

export const Paginator: React.FC<PaginatorProps> = ({ data, scrollX }) => {
  return (
    <View style={styles.container}>
      {data.map((_, i) => {
        const inputRange = [(i - 1) * 360, i * 360, (i + 1) * 360];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 16, 8],
          extrapolate: 'clamp',
        });
        return <Animated.View key={i} style={[styles.dot, { width: dotWidth }]} />;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#493d8a',
    marginHorizontal: 4,
  },
});
