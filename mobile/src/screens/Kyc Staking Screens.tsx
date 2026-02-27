// KYCRestrictionsAndStaking.tsx
// Combined UI for KYC restriction enforcement + Staking screens
// You can split these into separate files later.

import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

// --------------------------
// KYC RESTRICTION BANNER UI
// --------------------------
export const KycRestrictionBanner: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={{ backgroundColor: "#ffeae8", padding: 16, borderRadius: 12, marginVertical: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", color: "#c62828" }}>KYC Required</Text>
      <Text style={{ marginTop: 6, fontSize: 14, color: "#5a5a5a" }}>
        You must complete your Ghana Card verification before you can withdraw or stake ATC.
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate("KycStart" as never)}
        style={{ marginTop: 12, backgroundColor: "#c62828", padding: 10, borderRadius: 10 }}
      >
        <Text style={{ color: "white", textAlign: "center", fontSize: 15 }}>Start Verification</Text>
      </TouchableOpacity>
    </View>
  );
};

// --------------------------
// KYC START SCREEN
// --------------------------
export const KycStartScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <ScrollView style={{ flex: 1, padding: 18 }}>
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 8 }}>Identity Verification</Text>
      <Text style={{ fontSize: 15, color: "#555", marginBottom: 16 }}>
        Verify your identity using your Ghana Card. You will upload front & back images plus a selfie.
      </Text>

      <Image
        style={{ width: "100%", height: 180, borderRadius: 12 }}
        source={{ uri: "https://via.placeholder.com/300x150" }}
      />

      <TouchableOpacity
        onPress={() => navigation.navigate("KycSubmit" as never)}
        style={{ marginTop: 20, backgroundColor: "#0066ff", padding: 14, borderRadius: 12 }}
      >
        <Text style={{ color: "white", textAlign: "center", fontSize: 16, fontWeight: "600" }}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// --------------------------
// KYC SUBMIT SCREEN
// --------------------------
export const KycSubmitScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <ScrollView style={{ flex: 1, padding: 18 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Submit Documents</Text>
      <Text style={{ marginTop: 10, marginBottom: 16, fontSize: 15, color: "#444" }}>
        Upload the required documents to complete your verification.
      </Text>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>Ghana Card (Front)</Text>
        <View style={{ height: 150, backgroundColor: "#ececec", borderRadius: 12 }}></View>
        <TouchableOpacity style={{ marginTop: 10, padding: 12, backgroundColor: "#0066ff", borderRadius: 10 }}>
          <Text style={{ color: "white", textAlign: "center" }}>Upload Front</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>Ghana Card (Back)</Text>
        <View style={{ height: 150, backgroundColor: "#ececec", borderRadius: 12 }}></View>
        <TouchableOpacity style={{ marginTop: 10, padding: 12, backgroundColor: "#0066ff", borderRadius: 10 }}>
          <Text style={{ color: "white", textAlign: "center" }}>Upload Back</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>Selfie</Text>
        <View style={{ height: 150, backgroundColor: "#ececec", borderRadius: 12 }}></View>
        <TouchableOpacity style={{ marginTop: 10, padding: 12, backgroundColor: "#0066ff", borderRadius: 10 }}>
          <Text style={{ color: "white", textAlign: "center" }}>Capture Selfie</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate("Home" as never)}
        style={{ marginTop: 20, backgroundColor: "#00b33c", padding: 16, borderRadius: 12 }}
      >
        <Text style={{ color: "white", textAlign: "center", fontSize: 17, fontWeight: "700" }}>
          Submit Verification
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// --------------------------
// STAKE DETAILS SCREEN
// --------------------------
export const StakeDetailsScreen: React.FC = () => {
  return (
    <ScrollView style={{ flex: 1, padding: 18 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Staking</Text>
      <Text style={{ marginTop: 6, marginBottom: 20, fontSize: 15, color: "#444" }}>
        Earn rewards by staking your ATC. Higher durations earn more rewards.
      </Text>

      <View style={{ backgroundColor: "#f4f6ff", padding: 18, borderRadius: 14, marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>Your Balance</Text>
        <Text style={{ fontSize: 32, fontWeight: "900" }}>128 ATC</Text>
      </View>

      <View style={{ backgroundColor: "#fff", padding: 16, borderRadius: 14, marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>Staking Options</Text>

        {["30 Days — 6%", "60 Days — 15%", "90 Days — 30%"].map((option, i) => (
          <View
            key={i}
            style={{ padding: 12, borderRadius: 10, backgroundColor: "#eef1ff", marginBottom: 10 }}
          >
            <Text style={{ fontSize: 16 }}>{option}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={{ backgroundColor: "#0066ff", padding: 16, borderRadius: 14 }}>
        <Text style={{ color: "white", textAlign: "center", fontSize: 18, fontWeight: "700" }}>
          Start Staking
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
