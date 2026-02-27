import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import API from "../api/api";

type Conversion = {
  _id: string;
  amount: number;
  source: string;
  createdAt: string;
};

export default function ConversionHistoryScreen() {
  const [data, setData] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      const res = await API.get("/api/convert/history");
      setData(res.data);
    } catch (e) {
      console.error("Conversion history error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>Conversion History</Text>

      {data.length === 0 ? (
        <Text style={s.empty}>No conversions yet</Text>
      ) : (
        data.map(item => (
          <View key={item._id} style={s.card}>
            <Text style={s.amount}>
              +{item.amount.toFixed(6)} ATC
            </Text>

            <Text style={s.meta}>
              Source: {item.source}
            </Text>

            <Text style={s.date}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  empty: { color: "#666", textAlign: "center", marginTop: 40 },

  card: {
    backgroundColor: "#f8fafb",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },

  amount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0ea5a4",
  },

  meta: {
    fontSize: 12,
    color: "#555",
    marginTop: 4,
  },

  date: {
    fontSize: 11,
    color: "#888",
    marginTop: 6,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
