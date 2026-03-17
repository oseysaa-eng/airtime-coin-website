import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

import API from "../api/api";
import { startCallListener } from "../services/callDetector";

export default function CallMinerScreen() {

  const [active, setActive] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {

    startCallListener(

      () => {
        setActive(true);
        setSeconds(0);
      },

      async (duration: number) => {

        setActive(false);

        await API.post("/api/call/auto-credit", {
          seconds: duration
        });

      }

    );

  }, []);

  return (
    <View style={{ padding:20 }}>
      <Text style={{ fontSize:20 }}>
        Call Mining Active
      </Text>

      {active && (
        <Text>
          Call running...
        </Text>
      )}
    </View>
  );
}