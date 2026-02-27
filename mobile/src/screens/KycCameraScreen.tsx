// src/screens/KycCameraScreen.tsx
import { Camera } from "expo-camera";
import * as FaceDetector from "expo-face-detector";
import * as MediaLibrary from "expo-media-library";
import React, { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function KycCameraScreen({ navigation, route }: any) {
  const { mode } = route.params; // "idFront" | "idBack" | "selfie"
  const cameraRef = useRef<any>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [faces, setFaces] = useState<any[]>([]);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const cam = await Camera.requestCameraPermissionsAsync();
      const media = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(cam.status === "granted" && media.status === "granted");
    })();
  }, []);

  const handleFacesDetected = ({ faces }: any) => {
    setFaces(faces);
  };

  const take = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: false });
      setPhotoUri(photo.uri);

      // If selfie, ensure one face detected
      if (mode === "selfie") {
        if (faces.length === 0) {
          return Alert.alert("No face detected", "Please center your face and retake.");
        }
      }

      navigation.navigate("KycSubmit", { mode, uri: photo.uri });
    } catch (err) {
      console.error("take err", err);
      Alert.alert("Camera error", "Could not take photo.");
    }
  };

  if (hasPermission === false) return <View style={styles.center}><Text>No camera permissions</Text></View>;
  if (hasPermission === null) return <View style={styles.center}><Text>Requesting permissions...</Text></View>;

  return (
    <View style={{ flex: 1 }}>
      <Camera
        style={{ flex: 1 }}
        type={mode === "selfie" ? Camera.Constants.Type.front : Camera.Constants.Type.back}
        ref={cameraRef}
        onFacesDetected={mode === "selfie" ? handleFacesDetected : undefined}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
          runClassifications: FaceDetector.FaceDetectorClassifications.none,
        }}
      >
        <View style={styles.overlayTop}>
          <Text style={styles.modeText}>{mode === "selfie" ? "Capture selfie (face only)" : `Capture ${mode === "idFront" ? "ID front" : "ID back"}`}</Text>
        </View>

        {mode === "selfie" && (
          <View style={styles.faceHint}>
            <Text style={{ color: "#fff" }}>{faces.length ? "Face detected ✓" : "No face detected"}</Text>
          </View>
        )}
      </Camera>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
          <Text>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { backgroundColor: "#0ea5a4" }]} onPress={take}>
          <Text style={{ color: "#fff" }}>Capture</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  overlayTop: { position: "absolute", top: 40, alignSelf: "center" },
  modeText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  faceHint: { position: "absolute", top: 80, alignSelf: "center", backgroundColor: "rgba(0,0,0,0.35)", padding: 8, borderRadius: 8 },
  controls: { flexDirection: "row", justifyContent: "space-between", padding: 16, backgroundColor: "#fff" },
  btn: { padding: 12, borderRadius: 8, backgroundColor: "#eee", minWidth: 100, alignItems: "center" }
});
