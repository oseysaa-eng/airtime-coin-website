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
import { Animated, Easing } from "react-native";
import * as Haptics from "expo-haptics";

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
  const [floatingReward, setFloatingReward] = useState<number | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const [streak, setStreak] = useState(1);

  /* UNIQUE REWARD ID */
  const generateAdRewardId = () =>
    `ad_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  /* AD EVENTS */
useEffect(() => {
  const unsubscribe = rewarded.addAdEventsListener((event) => {
    switch (event.type) {

      case RewardedAdEventType.LOADED:
        console.log("✅ Ad Loaded");
        setRewardedReady(true);
        break;

      case RewardedAdEventType.EARNED_REWARD:
        console.log("🎉 Reward Earned");

        if (!rewardGivenRef.current) {
          rewardGivenRef.current = true;
          claimAdReward();
        }
        break;

      case RewardedAdEventType.CLOSED:
        console.log("📴 Ad Closed");

        setRewardedReady(false);   // temporarily false
        rewardGivenRef.current = false;

        // 🔥 reload with delay (IMPORTANT)
        setTimeout(() => {
          rewarded.load();
        }, 500);

        break;

      case RewardedAdEventType.ERROR:
        console.log("❌ Ad Error:", event.error);

        setRewardedReady(false);

        // 🔥 retry loading
        setTimeout(() => {
          rewarded.load();
        }, 2000);

        break;
    }
  });

  rewarded.load();
  fetchReferral();

  return () => unsubscribe();
}, []);

useEffect(() => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ])
  ).start();
}, []);

useEffect(() => {
  if (!rewardedReady) return;

  const loop = Animated.loop(
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ])
  );

  loop.start();

  return () => loop.stop(); // 🔥 cleanup
}, [rewardedReady]);

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

    const earned = res.data.creditedMinutes;

    Alert.alert("Reward Earned 🎉", `You earned ${earned} minutes`);

    emitDashboardUpdate();
    setCooldown(60);

    /* 💥 EFFECTS (MUST BE HERE) */

    // vibration
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // floating reward
    setFloatingReward(earned);

    Animated.sequence([
      Animated.timing(floatAnim, {
        toValue: -40,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(floatAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start(() => setFloatingReward(null));

    // streak
    setStreak((prev) => prev + 1);

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
    Alert.alert("Loading", "Ad is preparing...");
    rewarded.load(); // 🔥 force reload
    return;
  }

  rewardGivenRef.current = false;
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

    {floatingReward && (
  <Animated.View
    style={[
      s.floatingReward,
      { transform: [{ translateY: floatAnim }] },
    ]}
  >
    <Text style={s.floatingText}>+{floatingReward} mins ⚡</Text>
  </Animated.View>
)}

<View style={s.streakBox}>
  <Text style={s.streakText}>🔥 Streak: {streak}x</Text>
</View>
    
    {/* HEADER */}
    <Text style={s.title}>Earn Minutes ⚡</Text>

    {/* LIVE STATUS */}
    <View style={s.liveRow}>
      <View style={[s.liveDot, rewardedReady && s.liveActive]} />
      <Text style={s.liveText}>
        {rewardedReady ? "Ad ready to earn 🎬" : "Preparing reward system..."}
      </Text>
    </View>

    {/* 💥 REWARD POPUP */}
    {loading && (
      <View style={s.rewardPopup}>
        <Text style={s.rewardText}>Processing reward...</Text>
      </View>
    )}
    
    {/* 🎬 WATCH AD */}
<Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
  <TouchableOpacity
    style={[
      s.card,
      rewardedReady && s.cardActive,
      rewardedReady && s.glow
    ]}
    onPress={watchAd}
    activeOpacity={0.85}
  >
    <Text style={s.task}>🎬 Watch Rewarded Ad</Text>
    <Text style={s.reward}>+5 mins</Text>

    {rewardedReady ? (
      <Text style={s.ready}>Tap to earn now ⚡</Text>
    ) : (
      <Text style={s.loading}>Preparing ad...</Text>
    )}

    {cooldown > 0 && (
      <Text style={s.cooldown}>Next ad in {cooldown}s</Text>
    )}
  </TouchableOpacity>
</Animated.View>

    {/* 🎁 DAILY BONUS */}
    <TouchableOpacity style={s.card} onPress={claimDaily}>
      <Text style={s.task}>🎁 Daily Bonus</Text>
      <Text style={s.reward}>+3 mins</Text>
    </TouchableOpacity>

    {/* 📊 SURVEY */}
    <TouchableOpacity style={s.card} onPress={openSurvey}>
      <Text style={s.task}>📊 Complete Survey</Text>
      <Text style={s.reward}>+15 mins</Text>
    </TouchableOpacity>

    {/* 📞 CALL */}
    <TouchableOpacity
      style={s.card}
      onPress={() => navigation.navigate("CallSession")}
    >
      <Text style={s.task}>📞 Call Session</Text>
      <Text style={s.reward}>Earn while calling</Text>
    </TouchableOpacity>

    {/* REFERRAL */}
    <View style={s.refBox}>
      <Text style={s.refTitle}>Referral Code 🚀</Text>
      <Text style={s.refCode}>{refCode || "Loading..."}</Text>

      <TouchableOpacity style={s.refBtn} onPress={shareReferral}>
        <Text style={{ color: "#fff", fontWeight: "600" }}>
          Share Referral
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);
}


/* STYLES */
const s = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8fafc",
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 10,
  },

  /* LIVE */
  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#94a3b8",
    marginRight: 6,
  },

  liveActive: {
    backgroundColor: "#22c55e",
  },

  liveText: {
    fontSize: 12,
    color: "#64748b",
  },

  /* CARDS */
  card: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 18,
    marginBottom: 12,
    elevation: 3,
  },

  cardActive: {
    borderWidth: 1,
    borderColor: "#0ea5a4",
  },

  task: {
    fontSize: 16,
    fontWeight: "700",
  },

  reward: {
    marginTop: 6,
    color: "#0ea5a4",
    fontWeight: "800",
    fontSize: 16,
  },

  loading: {
    color: "#64748b",
    marginTop: 6,
    fontSize: 12,
  },

  ready: {
    marginTop: 6,
    color: "#16a34a",
    fontWeight: "600",
    fontSize: 12,
  },

  cooldown: {
    marginTop: 6,
    color: "#ef4444",
    fontSize: 12,
  },

  /* POPUP */
  rewardPopup: {
    position: "absolute",
    top: 70,
    alignSelf: "center",
    backgroundColor: "#022c22",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },

  rewardText: {
    color: "#4ade80",
    fontWeight: "700",
  },

  /* REFERRAL */
  refBox: {
    marginTop: 20,
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 18,
  },

  refTitle: {
    fontWeight: "700",
    marginBottom: 6,
  },

  refCode: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 10,
  },

  refBtn: {
    backgroundColor: "#0ea5a4",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

floatingReward: {
  position: "absolute",
  top: 100,
  alignSelf: "center",
  zIndex: 999,
  pointerEvents: "none", // 🔥 IMPORTANT
},

floatingText: {
  fontSize: 18,
  fontWeight: "900",
  color: "#22c55e",
},

glow: {
  shadowColor: "#0ea5a4",
  shadowOpacity: 0.8,
  shadowRadius: 12,
  elevation: 10,
},

streakBox: {
  backgroundColor: "#022c22",
  padding: 10,
  borderRadius: 12,
  marginBottom: 12,
  alignItems: "center",
},

streakText: {
  color: "#4ade80",
  fontWeight: "800",
},
});