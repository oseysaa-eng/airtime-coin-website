import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import API from "../api/api";
import KycGuard from "../components/KycGuard";
import KYCRequired from "../components/KYCRequired";
import { useKyc } from "../hooks/useKyc";

export default function WithdrawScreen() {
  const navigation = useNavigation();
  const { kycStatus } = useKyc();

  const [showKycModal, setShowKycModal] = useState(false);

  const [withdrawType, setWithdrawType] = useState<"MoMo" | "Crypto">("MoMo");
  const [wallet, setWallet] = useState("");
  const [network, setNetwork] = useState("");
  const [cryptoType, setCryptoType] = useState("");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(true);

  const momoNetworks = ["MTN", "AirtelTigo", "Telecel"];
  const cryptoNetworks = ["TRC20", "ERC20", "BEP20"];
  const cryptoTypes = ["USDT", "BTC", "ETH"];

  const withdrawFeePercent = 0.02;
  const amt = parseFloat(amount || "0");
  const fee = amt * withdrawFeePercent;
  const netAmount = amt - fee;

  // LOAD BALANCE
  const loadBalance = async () => {
    try {
      setLoadingBalance(true);
      const res = await API.get("/api/summary/balance");
      setBalance(res.data.balance);
    } catch (err) {
      Alert.alert("Error", "Failed to load balance.");
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    loadBalance();
  }, []);

  const validateMoMoNumber = (num: string) => /^0\d{9}$/.test(num);

  // SUBMIT
  const handleSubmit = async () => {
    // KYC gate
    if (kycStatus !== "verified") {
      setShowKycModal(true);
      return;
    }

    if (!wallet || !network || !amount || (withdrawType === "Crypto" && !cryptoType)) {
      return Alert.alert("Incomplete", "Please fill in all fields.");
    }

    if (withdrawType === "MoMo" && !validateMoMoNumber(wallet)) {
      return Alert.alert(
        "Invalid",
        "Enter a valid MoMo number (10 digits starting with 0)."
      );
    }

    const numeric = parseFloat(amount);
    if (!numeric || numeric <= 0) {
      return Alert.alert("Invalid", "Enter a valid amount.");
    }

    try {
      const res = await API.post("/api/withdraw", {
        amount: numeric,
        method: withdrawType,
        network,
        wallet,
        cryptoType: withdrawType === "Crypto" ? cryptoType : undefined,
      });

      const withdrawId = res.data.withdrawId;

      Alert.alert(
        "Requested",
        "Withdrawal created. Enter PIN to approve."
      );

      navigation.navigate("WithdrawPin", { withdrawId });

    } catch (err: any) {
      console.log("Withdraw Error:", err.response?.data || err);
      Alert.alert("Error", err.response?.data?.message || "Withdrawal failed");
    }
  };

  return (
    <KYCRequired>
      <View style={styles.container}>
        <Text style={styles.header}>Withdraw</Text>

        <KycGuard visible={showKycModal} onClose={() => setShowKycModal(false)} />

        {loadingBalance ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text style={styles.balanceText}>
            Available Balance: GHS {balance?.toFixed(2)}
          </Text>
        )}

        {/* TYPE TABS */}
        <View style={styles.tabContainer}>
          {["MoMo", "Crypto"].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.tab, withdrawType === type && styles.tabActive]}
              onPress={() => {
                setWithdrawType(type as "MoMo" | "Crypto");
                setCryptoType("");
                setNetwork("");
              }}
            >
              <Text style={withdrawType === type ? styles.tabTextActive : styles.tabText}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* WALLET */}
        <TextInput
          placeholder={withdrawType === "MoMo" ? "Enter MoMo Number" : "Enter Wallet Address"}
          style={styles.input}
          value={wallet}
          onChangeText={setWallet}
          keyboardType={withdrawType === "MoMo" ? "numeric" : "default"}
        />

        {/* NETWORK */}
        <Picker
          selectedValue={network}
          onValueChange={setNetwork}
          style={styles.picker}
        >
          <Picker.Item label={`Select ${withdrawType} Network`} value="" />
          {(withdrawType === "MoMo" ? momoNetworks : cryptoNetworks).map(item => (
            <Picker.Item key={item} label={item} value={item} />
          ))}
        </Picker>

        {/* CRYPTO TYPE */}
        {withdrawType === "Crypto" && (
          <Picker
            selectedValue={cryptoType}
            onValueChange={setCryptoType}
            style={styles.picker}
          >
            <Picker.Item label="Select Crypto Type" value="" />
            {cryptoTypes.map(item => (
              <Picker.Item key={item} label={item} value={item} />
            ))}
          </Picker>
        )}

        {/* AMOUNT */}
        <TextInput
          placeholder="Enter Amount"
          style={styles.input}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        {amount ? (
          <View style={styles.feeBox}>
            <Text style={styles.feeText}>
              Fee: GHS {fee.toFixed(2)} (2%)
            </Text>
            <Text style={styles.netText}>
              You Receive: GHS {netAmount.toFixed(2)}
            </Text>
          </View>
        ) : null}

        {/* SUBMIT */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>Proceed</Text>
        </TouchableOpacity>
      </View>
    </KYCRequired>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
  balanceText: { marginBottom: 20, fontSize: 16, fontWeight: "600", color: "#333" },

  tabContainer: { flexDirection: "row", marginBottom: 20 },
  tab: {
    flex: 1,
    padding: 12,
    backgroundColor: "#eee",
    alignItems: "center",
    borderRadius: 6,
    marginRight: 5,
  },
  tabActive: { backgroundColor: "#0ea5a4" },
  tabText: { color: "#555" },
  tabTextActive: { color: "#fff", fontWeight: "bold" },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },

  picker: {
    backgroundColor: "#f2f2f2",
    marginBottom: 12,
  },

  feeBox: { marginBottom: 12 },
  feeText: { color: "#888" },
  netText: { color: "#333", fontWeight: "600" },

  button: {
    backgroundColor: "#0ea5a4",
    padding: 14,
    alignItems: "center",
    borderRadius: 6,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
