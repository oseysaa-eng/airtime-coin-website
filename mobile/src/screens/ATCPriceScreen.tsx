import React, { useEffect, useState } from "react";
import { Dimensions, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import API from "../api/api";

const width = Dimensions.get("window").width;

export default function ATCPriceScreen() {
  const [data, setData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  const load = async (days: number) => {
    const res = await API.get(
      `/api/price/history?days=${days}`
    );

    setData(res.data.map((p: any) => p.price));

    setLabels(
      res.data.map((p: any) =>
        new Date(p.createdAt).toLocaleDateString()
      )
    );
  };

  useEffect(() => {
    load(7);
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>
        ATC Price History
      </Text>

      <LineChart
        data={{
          labels,
          datasets: [{ data }],
        }}
        width={width - 40}
        height={240}
        bezier
        chartConfig={{
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          color: o => `rgba(14,165,164,${o})`,
          labelColor: () => "#000",
        }}
        style={{ marginTop: 20, borderRadius: 12 }}
      />
    </View>
  );
}