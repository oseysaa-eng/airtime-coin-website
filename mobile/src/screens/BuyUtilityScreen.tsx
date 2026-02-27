import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../api/api";

type UtilityType = "AIRTIME" | "DATA" | "DSTV";

export default function BuyUtilityScreen() {
  const navigation = useNavigation<any>();

  const [balance, setBalance] = useState(0);
  const [rate, setRate] = useState(0);

  const [utility, setUtility] = useState<UtilityType>("AIRTIME");
  const [amountATC, setAmountATC] = useState("");

  const [phone, setPhone] = useState("");
  const [network, setNetwork] = useState("");
  const [accountId, setAccountId] = useState("");

  const [loading, setLoading] = useState(false);

  const utilityValue = Number(amountATC || 0) * rate;

  // ───────────────────────── LOAD WALLET + RATE
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const wallet = await api.get("/wallet");
      const rateRes = await api.get("/utility/rate");

      setBalance(wallet.data.balanceATC);
      setRate(rateRes.data.rate);
    } catch {
      Alert.alert("Error", "Failed to load utility data");
    }
  };

  // ───────────────────────── PURCHASE
  const buyUtility = async () => {
    const value = Number(amountATC);

    if (!value || value <= 0) {
      Alert.alert("Enter valid ATC amount");
      return;
    }

    if (value > balance) {
      Alert.alert("Insufficient ATC balance");
      return;
    }

    if (utility !== "DSTV" && !phone) {
      Alert.alert("Phone number required");
      return;
    }

    if (utility === "DATA" && !network) {
      Alert.alert("Network required");
      return;
    }

    if (utility === "DSTV" && !accountId) {
      Alert.alert("DSTV account / smart card required");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/utility/purchase", {
        utility,
        amountATC: value,
        phone,
        network,
        accountId,
      });

      navigation.replace("UtilitySuccess", {
        utility,
        value: res.data.value,
        atcSpent: res.data.atcSpent,
        reference: res.data.reference,
      });
    } catch (e: any) {
      Alert.alert(
        "Payment Failed",
        e.response?.data?.message || "Try again later"
      );
    } finally {
      setLoading(false);
    }
  };

  // ───────────────────────── UI
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>
        Buy Utilities with ATC
      </Text>

      <Text style={{ marginTop: 6, color: "#555" }}>
        Balance: {balance.toFixed(6)} ATC
      </Text>

      <Text style={{ marginTop: 4, color: "#555" }}>
        Live Rate: 1 ATC = ₵{rate}
      </Text>

      

      {/* UTILITY SELECT */}
      <View style={{ flexDirection: "row", marginTop: 20 }}>
        {(["AIRTIME", "DATA", "DSTV"] as UtilityType[]).map(u => (
          <TouchableOpacity
            key={u}
            onPress={() => setUtility(u)}
            style={{
              flex: 1,
              padding: 12,
              marginHorizontal: 4,
              borderRadius: 8,
              backgroundColor:
                utility === u ? "#0ea5a4" : "#f1f5f9",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "700",
                color: utility === u ? "#fff" : "#334155",
              }}
            >
              {u}
            </Text>

            
          </TouchableOpacity>
        ))}
        
      </View>

      

      {/* INPUTS */}
      {utility !== "DSTV" && (
        <TextInput
          placeholder="Phone number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          style={input}
        />
      )}

      {utility === "DATA" && (
        <TextInput
          placeholder="Network (MTN, AIRTEL, TELECEL)"
          value={network}
          onChangeText={setNetwork}
          style={input}
        />
      )}

      {utility === "DSTV" && (
        <TextInput
          placeholder="DSTV Smart Card / Account ID"
          value={accountId}
          onChangeText={setAccountId}
          style={input}
        />
      )}

      <TextInput
        placeholder="Amount in ATC"
        keyboardType="numeric"
        value={amountATC}
        onChangeText={setAmountATC}
        style={input}
      />

      {/* PREVIEW */}
      <Text style={{ marginTop: 12 }}>
        You will receive:
        <Text style={{ fontWeight: "700" }}>
          {" "}
          ₵{utilityValue.toFixed(2)}
        </Text>
      </Text>

      {/* PAY */}
      <TouchableOpacity
        onPress={buyUtility}
        disabled={loading}
        style={{
          backgroundColor: "#0ea5a4",
          padding: 16,
          borderRadius: 8,
          marginTop: 30,
          opacity: loading ? 0.6 : 1,
          
        }}
      >
        <Text
          style={{
            textAlign: "center",
            color: "#fff",
            fontWeight: "700",
          }}
        >
          {loading ? "Processing…" : "Pay with ATC"}
        </Text>
      </TouchableOpacity>


     <TouchableOpacity
  onPress={() => navigation.navigate("UtilityHistory")}
  style={{ marginTop: 8 }}
>
  <Text style={{ color: "#0ea5a4", fontSize: 13 }}>
    View Utility History →
  </Text>
</TouchableOpacity>

      
    </View>
  );
}

const input = {
  borderWidth: 1,
  borderColor: "#ddd",
  borderRadius: 8,
  padding: 12,
  marginTop: 16,
};

