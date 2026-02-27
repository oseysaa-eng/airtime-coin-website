import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import API from "../api/api";

type Stake = {
  amount: number;
  rewardAmount: number;
  unlockDate: string;
};

export default function StakeScreen() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [stake, setStake] = useState<Stake | null>(null);

  /* -----------------------------
     LOAD ACTIVE STAKE
  ------------------------------*/
  const loadStake = async () => {
    try {
      const res = await API.get("/api/stake");
      setStake(res.data);
    } catch (e) {
      console.log("No active stake");
    }
  };

  useEffect(() => {
    loadStake();
  }, []);

  /* -----------------------------
     CREATE STAKE
  ------------------------------*/
  const handleStake = async () => {
    const value = Number(amount);

    if (!value || value < 10) {
      Alert.alert("Minimum Stake", "Minimum stake is 10 ATC");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/api/stake", { amount: value });

      Alert.alert(
        "Stake Successful",
        `You staked ${value} ATC\nReward: ${res.data.stake.rewardAmount} ATC`
      );

      setAmount("");
      loadStake();
    } catch (e: any) {
      Alert.alert(
        "Stake Failed",
        e?.response?.data?.message || "Error staking ATC"
      );
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
     UI
  ------------------------------*/
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stake ATC</Text>

      {/* ACTIVE STAKE */}
      {stake ? (
        <View style={styles.card}>
          <Text style={styles.label}>Active Stake</Text>
          <Text>Amount: {stake.amount} ATC</Text>
          <Text>Reward: {stake.rewardAmount} ATC</Text>
          <Text>
            Unlocks on: {new Date(stake.unlockDate).toDateString()}
          </Text>

          <Text style={styles.locked}>
            🔒 Stake locked until unlock date
          </Text>
        </View>
      ) : (
        <>
          {/* INPUT */}
          <TextInput
            placeholder="Enter ATC amount"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            style={styles.input}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleStake}
            disabled={loading}
          >
            <Text style={styles.btnText}>
              {loading ? "Staking..." : "Stake ATC"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.info}>
            • Minimum stake: 10 ATC{"\n"}
            • Lock period: 30 days{"\n"}
            • Reward: +5%
          </Text>
        </>
      )}
    </View>
  );
}

/* -----------------------------
     STYLES
------------------------------*/
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },

  button: {
    backgroundColor: "#0ea5a4",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  info: {
    marginTop: 16,
    color: "#64748b",
    fontSize: 13,
  },

  card: {
    padding: 16,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
  },

  label: {
    fontWeight: "700",
    marginBottom: 8,
  },

  locked: {
    marginTop: 10,
    color: "#ef4444",
    fontWeight: "600",
  },
});
