import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from "react-native-google-mobile-ads";

import API from "../api/api";
import { emitDashboardUpdate } from "../utils/events";

/* CONFIG */

const REWARDED_AD_UNIT_ID = __DEV__
  ? TestIds.REWARDED
  : "ca-app-pub-1665828711086363/4578870803";

const rewarded = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID);

/* COMPONENT */

export default function EarnScreen() {
  const navigation = useNavigation<any>();

  const [rewardedReady, setRewardedReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refCode, setRefCode] = useState("");

  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);
  const rewardGivenRef = useRef(false);

  /* UNIQUE REWARD ID */

  const generateAdRewardId = () =>
    `ad_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  /* AD EVENTS */
useEffect(() => {
  const unsubscribe = rewarded.addAdEventsListener((event) => {
    switch (event.type) {
      case RewardedAdEventType.LOADED:
        setRewardedReady(true);
        break;

      case RewardedAdEventType.EARNED_REWARD:
        if (!rewardGivenRef.current) {
          rewardGivenRef.current = true;
          claimAdReward();
        }
        break;

      case RewardedAdEventType.CLOSED:
        rewarded.load();
        setRewardedReady(false);
        rewardGivenRef.current = false;
        break;

      case RewardedAdEventType.ERROR:
        console.log("Ad error:", event.error);
        break;
    }
  });

  rewarded.load();
  fetchReferral();

  return () => unsubscribe();
}, []);

  /* COOLDOWN TIMER */

  useEffect(() => {
    if (cooldown <= 0) {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current);
        cooldownRef.current = null;
      }
      return;
    }

    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [cooldown]);

  /* CLAIM AD REWARD */
const claimAdReward = async () => {
  try {
    setLoading(true);

    const res = await API.post("/api/ads/complete", {
      adRewardId: generateAdRewardId(),
      network: "ADMOB",
    });

    if (!res.data.success) throw new Error("Rejected");

    Alert.alert(
      "Reward Earned 🎉",
      `You earned ${res.data.creditedMinutes} minutes`
    );

    emitDashboardUpdate();
    setCooldown(60);

  } catch (err: any) {
    Alert.alert(
      "Reward Failed",
      err?.response?.data?.message || "Unable to credit reward"
    );
  } finally {
    setLoading(false);
  }
};
  /* WATCH AD */
const watchAd = () => {
  if (loading) return;

  if (cooldown > 0) {
    Alert.alert("Please wait", `Next ad in ${cooldown}s`);
    return;
  }

  if (!rewardedReady) {
    Alert.alert("Loading", "Ad is still loading...");
    return;
  }

  rewarded.show();
};

  /* REFERRAL */
      const fetchReferral = async () => {
    try {
      const res = await API.post("/api/referrals/create");
      setRefCode(res.data.code);
    } catch {
      // silent
    }
  };

  const shareReferral = async () => {
    if (!refCode) return;

    await Clipboard.setStringAsync(
      `Join Airtime Coin! Use my referral code ${refCode}`
    );

    Alert.alert("Copied", "Referral message copied to clipboard.");
  };

  /* DAILY BONUS */

  const claimDaily = async () => {
    try {
      setLoading(true);

      const res = await API.post("/api/earn");

      const earned = res?.data?.earnedMinutes || 0;

      Alert.alert("Daily Bonus", `+${earned} minutes`);

      emitDashboardUpdate();
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || "Failed to claim daily bonus"
      );
    } finally {
      setLoading(false);
    }
  };

  /* SURVEY */

  const openSurvey = async () => {
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) return;

    Linking.openURL(
      `https://offerwell.pipedrive.com/scheduler/drq7OqhD/offerwell-demo=${userId}`
    );
  };

  /* UI */

  return (
    <View style={s.container}>
      <Text style={s.title}>Earn Minutes</Text>

      <TouchableOpacity style={s.card} onPress={watchAd} disabled={loading}>
        <Text style={s.task}>Watch Rewarded Ad</Text>
        <Text style={s.reward}>+5 mins</Text>

        {!rewardedReady && (
          <Text style={s.loading}>Loading ad...</Text>
        )}

        {cooldown > 0 && (
          <Text style={s.loading}>Next ad in {cooldown}s</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={s.card} onPress={claimDaily}>
        <Text style={s.task}>Claim Daily Bonus</Text>
        <Text style={s.reward}>+3 mins</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.card} onPress={openSurvey}>
        <Text style={s.task}>Complete Survey</Text>
        <Text style={s.reward}>+15 mins</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={s.card}
        onPress={() => navigation.navigate("CallSession")}
      >
        <Text style={s.task}>📞 Call Session</Text>
        <Text style={s.reward}>Earn from calls</Text>
      </TouchableOpacity>

      <View style={{ height: 20 }} />

      <Text style={{ fontWeight: "700" }}>Referral</Text>
      <Text>Your code: {refCode || "—"}</Text>

      <TouchableOpacity style={s.refBtn} onPress={shareReferral}>
        <Text style={{ color: "#fff" }}>Share</Text>
      </TouchableOpacity>
    </View>
  );
}

/* STYLES */

const s = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },

  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },

  card: {
    padding: 16,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    marginBottom: 10,
  },

  task: { fontSize: 16, fontWeight: "600" },

  reward: {
    marginTop: 6,
    color: "#0ea5a4",
    fontWeight: "700",
  },

  loading: {
    color: "#64748b",
    marginTop: 6,
    fontSize: 12,
  },

  refBtn: {
    marginTop: 8,
    backgroundColor: "#0ea5a4",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});