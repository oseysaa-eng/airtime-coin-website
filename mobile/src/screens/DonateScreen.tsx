import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import API from "../api/api";

const screenWidth = Dimensions.get('window').width;

export default function DonateScreen() {
  const [amount, setAmount] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ================================
  // 🔥 Load Donation Data from Backend
  // ================================
  const loadDonationData = async () => {
    try {
      setLoading(true);

      // TODO: Replace with your backend endpoint
      const res = await API.get("/api/donations/history");

      setHistory(res.data.history || []);
      setLeaderboard(res.data.leaderboard || []);

    } catch (err) {
      console.log("Donation load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonationData();
  }, []);

  // ================================
  // ⭐ Handle Donate Action
  // ================================
  const handleDonate = async () => {
    if (!amount) return;

    try {
      // TODO: Replace with your donate endpoint
      await API.post("/api/donations/send", {
        amount: Number(amount),
      });

      alert(`Thank you for donating GHS ${amount}!`);
      setAmount('');

      loadDonationData(); // refresh
    } catch (err) {
      alert("Failed to process donation.");
    }
  };

  // ================================
  // 📊 Chart Data Preparation
  // ================================
  const chartData = {
    labels: history.map((item) => item.date),
    datasets: [
      {
        data: history.map((item) => item.amount),
      },
    ],
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Support the ATC Community</Text>

      {/* Donation Input */}
      <TextInput
        placeholder="Enter amount (GHS)"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
      />

      <TouchableOpacity style={styles.donateButton} onPress={handleDonate}>
        <Ionicons name="heart" size={20} color="#fff" />
        <Text style={styles.donateText}>Donate</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#777777ff" style={{ marginTop: 20 }} />
      ) : (
        <>
          {/* Chart */}
          <Text style={styles.sectionTitle}>Donation Chart</Text>
          {history.length > 0 ? (
            <LineChart
              data={chartData}
              width={screenWidth - 32}
              height={220}
              chartConfig={{
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255,99,132, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              }}
              bezier
              style={{ marginBottom: 20, borderRadius: 16 }}
            />
          ) : (
            <Text style={styles.emptyText}>No donation data yet.</Text>
          )}

          {/* Donation History */}
          <Text style={styles.sectionTitle}>Donation History</Text>
          {history.length === 0 ? (
            <Text style={styles.emptyText}>No donations yet.</Text>
          ) : (
            history.map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <Text style={styles.historyText}>
                  GHS {item.amount}
                </Text>
                <Text style={styles.historyDate}>{item.date}</Text>
              </View>
            ))
          )}

          {/* Leaderboard */}
          <Text style={styles.sectionTitle}>Top Donors</Text>
          {leaderboard.length === 0 ? (
            <Text style={styles.emptyText}>No top donors yet.</Text>
          ) : (
            leaderboard.map((item, index) => (
              <View key={item.id} style={styles.leaderboardItem}>
                <Text style={styles.rank}>{index + 1}.</Text>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.total}>GHS {item.total}</Text>
              </View>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 16,
    color: '#222',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  donateButton: {
    flexDirection: 'row',
    backgroundColor: '#0ea5a4',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  donateText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 12,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  historyText: {
    color: '#444',
  },
  historyDate: {
    color: '#888',
    fontSize: 12,
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#e8f0fe',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  rank: {
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  name: {
    fontWeight: '500',
  },
  total: {
    fontWeight: 'bold',
    color: '#222',
  },
});
