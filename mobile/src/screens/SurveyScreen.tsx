// SurveyScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const surveys = [
  {
    id: '1',
    title: 'Customer Satisfaction Survey',
    reward: 0.4,
    duration: '3 mins',
  },
  {
    id: '2',
    title: 'Product Feedback',
    reward: 0.6,
    duration: '5 mins',
  },
  {
    id: '3',
    title: 'Lifestyle Poll',
    reward: 0.3,
    duration: '2 mins',
  },
];

const SurveyScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Take Surveys & Earn ATC</Text>
      <FlatList
        data={surveys}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Ionicons name="document-text-outline" size={30} color="#1e90ff" style={{ marginRight: 16 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.sub}>{item.duration} • Earn {item.reward} ATC</Text>
            </View>
            <TouchableOpacity style={styles.startBtn}>
              <Text style={styles.startText}>Start</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </View>
  );
};

export default SurveyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f8ff',
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  sub: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  startBtn: {
    backgroundColor: '#1e90ff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  startText: {
    color: '#fff',
    fontWeight: '600',
  },
});
