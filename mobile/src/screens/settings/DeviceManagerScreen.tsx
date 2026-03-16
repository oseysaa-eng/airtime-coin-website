import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  View,
} from "react-native";

import api from "../../api/api";
import DeviceCard from "./components/DeviceCard";

export default function TrustedDevicesScreen() {

  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDevices = async () => {

    try {

      const res = await api.get("/api/devices");

      setDevices(res.data.devices || []);

    } catch (err) {

      console.error("Device load error", err);

      Alert.alert("Error","Failed to load devices");

    } finally {

      setLoading(false);

    }

  };

  const removeDevice = async (deviceId: string) => {

    Alert.alert(
      "Remove device",
      "This device will be logged out immediately.",
      [
        { text: "Cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {

            try {

              await api.delete(`/api/device/${deviceId}/remove`);
              

              loadDevices();

            } catch {

              Alert.alert("Error","Failed to remove device");

            }

          },
        },
      ]
    );

  };

  useEffect(() => {
    loadDevices();
  }, []);

  if (loading) {

    return (
      <View style={{ padding: 20 }}>
        <Text>Loading devices…</Text>
      </View>
    );

  }

  if (!devices.length) {

    return (
      <View style={{ padding: 20 }}>
        <Text>No trusted devices found.</Text>
      </View>
    );

  }

  return (

    <ScrollView
      style={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
    >

      <Text
        style={{
          fontSize: 18,
          fontWeight: "700",
          marginBottom: 12,
        }}
      >
        Trusted Devices
      </Text>

      <Text
        style={{
          fontSize: 13,
          color: "#64748b",
          marginBottom: 20,
        }}
      >
        These devices are allowed to access your AirtimeCoin account.
      </Text>

      {devices.map((d) => (

        <DeviceCard
          key={d._id}
          device={d}
          current={d.current === true}
          onRemove={() => removeDevice(d._id)}
        />

      ))}

    </ScrollView>

  );

}