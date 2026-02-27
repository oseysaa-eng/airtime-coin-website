import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type Props = {
  type: string;
  amount: number;
};


const EarnCard = ({
  icon,
  title,
  minutes,
  backgroundColor,
}: {
  icon: string;
  title: string;
  minutes: number;
  backgroundColor: string;
}) => (
  <View style={[earnCardStyles.card, { backgroundColor }]}>
    <Text style={earnCardStyles.icon}>{icon}</Text>
    <View>
      <Text style={earnCardStyles.title}>{title}</Text>
      <Text style={earnCardStyles.minutes}>{minutes} minutes</Text>
    </View>
  </View>
);

const earnCardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  icon: {
    fontSize: 28,
    marginRight: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  minutes: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
  },
});

