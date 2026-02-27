// src/screens/KycCaptureSelfieScreen.tsx
import { useNavigation, useRoute } from "@react-navigation/native";
import { Camera } from "expo-camera";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function KycCaptureSelfieScreen() {
  const nav = useNavigation();
  const route = useRoute();
  const frontUri = (route.params as any)?.frontUri;
  const backUri = (route.params as any)?.backUri;

  const [hasPerm, setHasPerm] = useState<boolean | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const camRef = useRef<Camera | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPerm(status === "granted");
      if (status !== "granted") Alert.alert("Permission", "Camera permission required for selfie");
    })();
  }, []);

  const snap = async () => {
    if (!camRef.current) return;
    const p = await camRef.current.takePictureAsync({ quality: 0.8, base64: false });
    setPhoto(p.uri);
  };

  const next = () => {
    if (!photo) return Alert.alert("Capture", "Please take a selfie");
    nav.navigate("KycSubmit" as any, { frontUri, backUri, selfieUri: photo });
  };

  if (hasPerm === null) return null;
  if (!hasPerm) return <View style={{flex:1,justifyContent:"center",alignItems:"center"}}><Text>No camera permission</Text></View>;

  return (
    <View style={{ flex: 1 }}>
      {!photo ? (
        <>
          <Camera ref={ref => (camRef.current = ref)} style={{ flex: 1 }} ratio="4:3" autoFocus="on">
            <View style={s.overlay}>
              <Text style={s.hint}>Center your face in the circle</Text>
              <View style={s.faceCircle} />
            </View>
          </Camera>

          <TouchableOpacity style={s.takeBtn} onPress={snap}><Text style={{color:"#fff"}}>Take Selfie</Text></TouchableOpacity>
        </>
      ) : (
        <View style={{flex:1, padding:16}}>
          <Image source={{ uri: photo }} style={{ flex:1, borderRadius:8 }} />
          <TouchableOpacity onPress={() => setPhoto(null)} style={s.takeBtn}><Text style={{color:"#fff"}}>Retake</Text></TouchableOpacity>
          <TouchableOpacity onPress={next} style={[s.takeBtn, { backgroundColor: "#0ea5a4", marginTop:8 }]}><Text style={{color:"#fff"}}>Continue</Text></TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: 'transparent' },
  faceCircle: { width: 200, height: 200, borderRadius: 100, borderWidth: 3, borderColor: "rgba(255,255,255,0.9)" },
  hint: { position: "absolute", top: 30, color: "#fff", fontWeight: "600" },
  takeBtn: { position: "absolute", bottom: 32, alignSelf: "center", backgroundColor: "#0b7285", padding: 12, borderRadius: 8 }
});
