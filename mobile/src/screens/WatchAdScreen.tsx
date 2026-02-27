import React, { useEffect, useState } from "react";
import { Alert, Button, View } from "react-native";
import {
  RewardedAdEventType,
} from "react-native-google-mobile-ads";
import { rewardedAd } from "../ads/rewardedAd";
import API from "../api/api";

export default function WatchAdScreen() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = rewardedAd.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        setLoaded(true);
      }
    );

    const rewardUnsubscribe = rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      async (reward) => {
        // ✅ USER FINISHED AD
        try {
          await creditReward();
          Alert.alert("Success", "You earned airtime minutes 🎉");
        } catch (e) {
          Alert.alert("Error", "Reward failed to credit");
        }
      }
    );

    rewardedAd.load();

    return () => {
      unsubscribe();
      rewardUnsubscribe();
    };
  }, []);

  const creditReward = async () => {
    await API.post("/api/rewards/ad", {
      minutes: 5, // example
    });
  };

  return (
    <View>
      <Button
        title="Watch Ad"
        disabled={!loaded}
        onPress={() => rewardedAd.show()}
      />
    </View>
  );
}
