import React, { useEffect, useState } from "react";
import {
    ScrollView,
    Text,
    TouchableOpacity,
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

  const load = async () => {
    const res = await getWallets();
    setWallets(res.data.wallets);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <ScrollView style={{ padding: 16 }}>
        {wallets.map(w => (
          <WalletCard
            key={w._id}
            wallet={w}
            onDelete={async () => {
              await removeWallet(w._id);
              load();
            }}
            onSetDefault={async () => {
              await setDefaultWallet(w._id);
              load();
            }}
          />
        ))}

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