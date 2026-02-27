// src/screens/WithdrawHistoryScreen.tsx
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import API from "../api/api";

const WithdrawHistoryScreen = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/api/withdraw");
        setData(res.data.withdraws || []);
      } catch (err) {
        console.error("withdraw history", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <ActivityIndicator />;

  return (
    <FlatList
      data={data}
      keyExtractor={(i) => i._id}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text>{item.amount} ATC — {item.status}</Text>
          <Text style={styles.small}>{item.network} • {item.wallet}</Text>
          <Text style={styles.small}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
      )}
    />
  );
};

export default WithdrawHistoryScreen;

const styles = StyleSheet.create({
  row: { padding: 12, borderBottomWidth: 1, borderColor: "#eee" },
  small: { color: "#666", marginTop: 4, fontSize: 12 },
});
