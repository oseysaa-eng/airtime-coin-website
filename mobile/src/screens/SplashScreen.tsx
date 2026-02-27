import * as Splash from "expo-splash-screen";
import React, { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import * as Animatable from "react-native-animatable";

export default function SplashScreen() {
  useEffect(() => {
    const hide = async () => {
      await new Promise(r => setTimeout(r, 1200));
      await Splash.hideAsync();
    };
    hide();
  }, []);

  return (
    <View style={styles.container}>
      <Animatable.View
        animation={{
          0: { scale: 0.95, opacity: 0.7 },
          0.5: { scale: 1.05, opacity: 1 },
          1: { scale: 0.95, opacity: 0.7 },
        }}
        iterationCount="infinite"
        duration={1800}
        style={styles.glow}
      >
        <View style={styles.logoWrapper}>
          <Image
            source={require("../assets/logo.png")}
            style={styles.logo}
          />
        </View>
      </Animatable.View>
    </View>
  );
}

const SIZE = 160;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  glow: {
    width: SIZE + 20,
    height: SIZE + 20,
    borderRadius: (SIZE + 20) / 2,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#c5c5c5ff",
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 25,
  },
  logoWrapper: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: "#0ea5a4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  logo: {
    width: SIZE * 0.6,
    height: SIZE * 0.6,
    tintColor: "#ffffff",
  },
});