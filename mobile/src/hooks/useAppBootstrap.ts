import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { connectSocket } from "../services/socket";
import { useUserStore } from "../store/useUserStore";

export function useAppBootstrap() {
  const { setUser, fetchKyc, fetchPin } = useUserStore();

  const [initialRoute, setInitialRoute] = useState("Login");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const userId = await AsyncStorage.getItem("userId");
        const onboarded = await AsyncStorage.getItem("hasOnboarded");
        const selectedLang = await AsyncStorage.getItem("selectedLanguage");

        /* 🌍 LANGUAGE */
        if (!selectedLang) {
          setInitialRoute("Language");
          return;
        }

        /* 👋 ONBOARDING */
        if (onboarded !== "true") {
          setInitialRoute("Onboarding");
          return;
        }

        /* 🔐 AUTH */
        if (token && userId) {
          setUser(userId);

          try {
            // ⚡ preload safely
            await Promise.all([
              fetchKyc(),
              fetchPin(),
            ]);
          } catch (e) {
            console.log("⚠️ Preload skipped (token may be expired)");
          }

          try {
            // 🔌 connect socket properly
            await connectSocket();
          } catch (e) {
            console.log("⚠️ Socket connect failed");
          }

          setInitialRoute("MainTabs");
          return;
        }

        /* ❌ DEFAULT */
        setInitialRoute("Login");

      } catch (err) {
        console.log("Bootstrap error:", err);
        setInitialRoute("Login");
      } finally {
        setReady(true);
      }
    };

    init();
  }, []);

  return { initialRoute, ready };
}