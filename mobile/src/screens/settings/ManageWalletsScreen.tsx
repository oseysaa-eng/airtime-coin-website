import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  getWallets,
  removeWallet,
  setDefaultWallet,
} from "../../api/walletApi";

import AddWalletModal from "./components/AddWalletModal";
import WalletCard from "./components/WalletCard";

export default function ManageWalletsScreen() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getWallets();
      setWallets(res.data.wallets || []);
    } catch (err: any) {
      Alert.alert("Error", "Failed to load wallets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ================= DELETE ================= */
  const handleDelete = (id: string) => {
    Alert.alert("Delete Wallet", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await removeWallet(id);
            setWallets((prev) => prev.filter((w) => w._id !== id));
          } catch {
            Alert.alert("Error", "Failed to delete wallet");
          }
        },
      },
    ]);
  };

  /* ================= SET DEFAULT ================= */
  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultWallet(id);

      // instant UI update
      setWallets((prev) =>
        prev.map((w) => ({
          ...w,
          isDefault: w._id === id,
        }))
      );
    } catch {
      Alert.alert("Error", "Failed to set default wallet");
    }
  };

  /* ================= UI ================= */

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <ScrollView style={{ padding: 16 }}>

        {/* EMPTY STATE */}
        {wallets.length === 0 && (
          <Text style={{ textAlign: "center", marginTop: 50 }}>
            No wallets added yet
          </Text>
        )}

        {/* LIST */}
        {wallets.map((w) => (
          <WalletCard
            key={w._id}
            wallet={w}
            onDelete={() => handleDelete(w._id)}
            onSetDefault={() => handleSetDefault(w._id)}
          />
        ))}

        {/* ADD BUTTON */}
        <TouchableOpacity
          onPress={() => setShowAdd(true)}
          style={{
            backgroundColor: "#0ea5a4",
            padding: 16,
            borderRadius: 14,
            marginTop: 10,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontWeight: "700",
              textAlign: "center",
            }}
          >
            + Add Wallet
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <AddWalletModal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onAdded={load}
      />
    </>
  );
}