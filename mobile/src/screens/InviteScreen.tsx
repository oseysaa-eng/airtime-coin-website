import * as Clipboard from "expo-clipboard";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import API from "../api/api";

export default function InviteScreen() {
  const [referralCode, setReferralCode] = useState("");
  const [inviteCount, setInviteCount] = useState(0);
  const [earnedATC, setEarnedATC] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Load real referral data
  useEffect(() => {
    fetchReferralData();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);



const fetchReferralData = async () => {
  try {
    const res = await API.get("/api/referrals/stats");

    setReferralCode(res.data.referralCode);
    setInviteCount(res.data.inviteCount);
    setEarnedATC(res.data.earnedFromReferrals);

  } catch (err) {
    console.log("Referral load error:", err);
    Alert.alert("Error", "Unable to load referral data.");
  }
};

  const handleCopy = async () => {
    await Clipboard.setStringAsync(referralCode);
    Alert.alert("Copied!", "Referral code copied.");
  };

  const handleShare = async () => {
    try {
      const message = `Join ATC and earn Airtime Coin!\nUse my code: ${referralCode}`;
      await Share.share({ message });
    } catch (error) {
      Alert.alert("Error", "Sharing failed.");
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.title}>Invite & Earn</Text>
        <Text style={styles.subtitle}>
          Share your unique referral code to earn ATC.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Your Referral Code</Text>
          <Text style={styles.code}>{referralCode}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
              <Text style={styles.copyText}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsText}>Invites: {inviteCount}</Text>
          <Text style={styles.statsText}>Earnings: {earnedATC} ATC</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FAFAFA" },
  title: { fontSize: 26, fontWeight: "700", color: "#333", marginBottom: 6 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    borderColor: "#DDD",
    borderWidth: 1,
    marginBottom: 20,
  },
  label: { fontSize: 14, color: "#777" },
  code: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#0ea5a4",
    marginVertical: 10,
  },
  buttonRow: { flexDirection: "row", justifyContent: "space-between" },
  copyButton: {
    backgroundColor: "#88c5c5ff",
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  shareButton: {
    backgroundColor: "#0ea5a4",
    padding: 10,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
  },
  copyText: { color: "#333", fontWeight: "600" },
  shareText: { color: "#fff", fontWeight: "600" },
  statsCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    borderColor: "#DDD",
    borderWidth: 1,
  },
  statsText: { fontSize: 16, color: "#444", marginBottom: 8 },
});
