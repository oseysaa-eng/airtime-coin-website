import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const donationHistory = [
  { id: '1', amount: 15, date: '2025-05-20' },
  { id: '2', amount: 10, date: '2025-05-15' },
  { id: '3', amount: 20, date: '2025-05-10' },
];

const topDonors = [
  { id: 'u1', name: 'Ama Asante', amount: 120 },
  { id: 'u2', name: 'Kwame Mensah', amount: 85 },
  { id: 'u3', name: 'Efua Sarpong', amount: 75 },
];

const DonationHistoryScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Your Donation History</Text>
      <FlatList
        data={donationHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.historyItem}>
            <Ionicons name="cash-outline" size={20} color="#1e90ff" />
            <Text style={styles.historyText}>
              Donated {item.amount} ATC on {item.date}
            </Text>
          </View>
        )}
      />

      <Text style={[styles.header, { marginTop: 24 }]}>Top Donors</Text>
      <FlatList
        data={topDonors}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.leaderItem}>
            <Text style={styles.rank}>{index + 1}</Text>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.amount}>{item.amount} ATC</Text>
          </View>
        )}
      />

      {/* Optional Placeholder for a Chart */}
      <View style={styles.chartBox}>
        <Ionicons name="stats-chart-outline" size={40} color="#888" />
        <Text style={styles.chartText}>Donation Trends Chart Coming Soon</Text>
      </View>
    </ScrollView>
  );
};

export default DonationHistoryScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    flexGrow: 1,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e90ff',
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef5ff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  historyText: {
    marginLeft: 10,
    color: '#333',
    fontSize: 15,
  },
  leaderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    elevation: 1,
  },
  rank: {
    fontWeight: '700',
    color: '#1e90ff',
  },
  name: {
    fontWeight: '600',
    color: '#333',
  },
  amount: {
    fontWeight: '600',
    color: '#1e90ff',
  },
  chartBox: {
    marginTop: 30,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eee',
    borderRadius: 12,
  },
  chartText: {
    marginTop: 10,
    color: '#555',
    fontStyle: 'italic',
  },
});
