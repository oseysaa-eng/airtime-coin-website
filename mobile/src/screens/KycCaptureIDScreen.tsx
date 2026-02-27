// src/screens/KycCaptureIDScreen.tsx
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function KycCaptureIDScreen() {
  const nav = useNavigation();
  const route = useRoute();
  const { mode } = (route.params as any) || { mode: "front" };
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") Alert.alert("Permission", "Photo permissions are required");
    })();
  }, []);

  const pick = async () => {
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!res.canceled) setUri(res.assets[0].uri);
  };

  const next = () => {
    if (!uri) return Alert.alert("No image", "Please capture the ID side");
    // navigate to the other capture or submit
    if (mode === "front") {
      nav.navigate("KycCaptureID" as any, { mode: "back", frontUri: uri });
    } else {
      // back captured — go to selfie
      const frontUri = (route.params as any)?.frontUri;
      nav.navigate("KycCaptureSelfie" as any, { frontUri, backUri: uri });
    }
  };

  return (
    <View style={s.container}>
      <Text style={s.h}>Capture ID - {mode === "front" ? "Front" : "Back"}</Text>

      <TouchableOpacity onPress={pick} style={s.capture}>
        <Text style={{ color:"#fff" }}>Open Camera</Text>
      </TouchableOpacity>

      {uri && <Image source={{ uri }} style={s.preview} />}

      <TouchableOpacity style={s.next} onPress={next}>
        <Text style={{ color:"#fff" }}>{mode === "front" ? "Next (Capture Back)" : "Continue to Selfie"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex:1, padding:20, backgroundColor:"#fff" },
  h: { fontSize:18, fontWeight:"700" },
  capture: { marginTop:20, backgroundColor:"#0ea5a4", padding:12, borderRadius:8, alignItems:"center" },
  preview: { width:"100%", height:300, marginTop:16, borderRadius:8 },
  next: { marginTop:12, backgroundColor:"#0b7285", padding:12, borderRadius:8, alignItems:"center" }
});
