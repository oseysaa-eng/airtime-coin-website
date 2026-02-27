import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from "react-native";
import api from "../api/api";

type UtilityTx = {
  _id: string;
  type: string;
  source: string;
  amount: number;
  status: string;
  createdAt: string;
  meta?: {
    providerValue?: number;
    reference?: string;
  };
};

export default function UtilityHistoryScreen() {
  const [txs, setTxs] = useState<UtilityTx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await api.get("/utility/history");
      setTxs(res.data);
    } catch (e) {
      console.log("History error", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Text style={s.title}>Utility History</Text>

      <FlatList
        data={txs}
        keyExtractor={item => item._id}
        ListEmptyComponent={
          <Text style={s.empty}>
            No utility transactions yet
          </Text>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.row}>
              <Text style={s.utility}>{item.source}</Text>
              <Text
                style={[
                  s.status,
                  item.status === "SUCCESS"
                    ? s.success
                    : s.failed,
                ]}
              >
                {item.status}
              </Text>
            </View>

            <Text style={s.amount}>
              − {item.amount} ATC
            </Text>

            {item.meta?.providerValue && (
              <Text style={s.value}>
                Value: ₵{item.meta.providerValue}
              </Text>
            )}

            {item.meta?.reference && (
              <Text style={s.ref}>
                Ref: {item.meta.reference}
              </Text>
            )}

            <Text style={s.date}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#f8fafb",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  utility: {
    fontWeight: "700",
    fontSize: 14,
  },

  status: {
    fontSize: 12,
    fontWeight: "700",
  },

  success: {
    color: "#16a34a",
  },

  failed: {
    color: "#dc2626",
  },

  amount: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 4,
  },

  value: {
    fontSize: 13,
    color: "#334155",
    marginTop: 2,
  },

  ref: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },

  date: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 6,
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#94a3b8",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});