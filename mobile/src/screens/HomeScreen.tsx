import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { LineChart } from "react-native-chart-kit";

import API from "../api/api";
import { useWallet } from "../context/WalletContext";
import { useAnimatedNumber } from "../hooks/useAnimatedNumber";
import { subscribeDashboard } from "../utils/events";
import { getGreeting } from "../utils/greeting";
import { connectSocket, onSocketEvent } from "../services/socket";
import { useRef } from "react";


const screenWidth = Dimensions.get("window").width;


type Tx = {
  _id: string;
  type: string;
  amount: number;
  source: string;
  createdAt: string;
  
};

type Dashboard = {
  name: string;
  balance: number;
  totalMinutes: number;
  todayMinutes: number;
  weeklyMinutes: number[];
  recentTx: Tx[];
  trustStatus?: "good" | "reduced" | "limited" | "blocked";
  
};



const defaultChart = [0, 0, 0, 0, 0, 0, 0];

export default function HomeScreen() {

  const navigation = useNavigation<any>();


  const [dashboard,setDashboard] = useState<Dashboard | null>(null);
  const [loading,setLoading] = useState(true);
  const [refreshing,setRefreshing] = useState(false);
  const [price,setPrice] = useState<number | null>(null);
  const [hideBalance,setHideBalance] = useState(false);
  const lastUpdateRef = useRef(0);
  const [rewardPopup, setRewardPopup] = useState<number | null>(null);
  const [isEarning, setIsEarning] = useState(false);
  


  /* ================= FETCH ================= */

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await API.get("/api/summary");
      setDashboard(res.data);
    } catch (e) {
      console.log("Dashboard error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadPrice = useCallback(async () => {
    try {
      const res = await API.get("/api/price");
      setPrice(res.data?.price ?? null);
    } catch (e) {
      console.log("Price error:", e);
    }
  }, []);



   /* ================= INIT ================= */

  useEffect(() => {
    fetchDashboard();
    loadPrice();
  }, []);

  /* ================= SOCKET ================= */


useEffect(() => {
  let unsubWallet: any;
  let unsubMinutes: any;

  let mounted = true;

  const setup = async () => {
    const socket = await connectSocket();
    if (!socket || !mounted) return;

    const attachListeners = async () => {
      console.log("✅ Socket listeners attached");

      /* ================= WALLET UPDATE ================= */
      unsubWallet = await onSocketEvent("WALLET_UPDATE", (data) => {
        console.log("🔥 WALLET_UPDATE:", data);

        setDashboard((prev: any) => {
          if (!prev) return prev;

          return {
            ...prev,
            balance: data.balance ?? prev.balance,
            totalMinutes: data.totalMinutes ?? prev.totalMinutes,
            todayMinutes: data.todayMinutes ?? prev.todayMinutes,
          };
        });
      });

      

      /* ================= MINUTES CREDIT ================= */
      unsubMinutes = await onSocketEvent("MINUTES_CREDIT", (data) => {
        console.log("⚡ MINUTES_CREDIT:", data);

        const earned = data?.minutes || 0;

        if (!earned) return;

        setRewardPopup(earned);
        setIsEarning(true);

        setTimeout(() => {
          setRewardPopup(null);
          setIsEarning(false);
        }, 2000);
      });
    };

    if (socket.connected) {
      attachListeners();
    } else {
      socket.once("connect", attachListeners);
    }
  };

  setup();

  return () => {
    mounted = false;
    unsubWallet?.();
    unsubMinutes?.();
  };
}, []);

/* ================= VALUES ================= */
  const atcValue = dashboard?.balance ?? 0;
  const minutesValue = dashboard?.totalMinutes ?? 0;


  const animatedATC = useAnimatedNumber(atcValue);
  const animatedMinutes = useAnimatedNumber(minutesValue);

  /* ================= REFRESH ================= */

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
  };

  /* ================= UI STATES ================= */

  if (loading) {
    return (
      <View style={s.loader}>
        <ActivityIndicator size="large" color="#0ea5a4" />
        <Text style={{ marginTop: 10 }}>Loading wallet...</Text>
      </View>
    );
  }

  if (!dashboard) {
    return (
      <View style={s.center}>
        <Ionicons name="cloud-offline-outline" size={40} color="#94a3b8" />
        <Text style={{ marginTop: 10 }}>Unable to load dashboard</Text>
      </View>
    );
  }




 /* ================= CHART ================= */

  const weeklyData = Array.isArray(dashboard.weeklyMinutes)
    ? dashboard.weeklyMinutes.slice(0, 7)
    : defaultChart;

  const chartData = {
    labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
    datasets: [{ data: weeklyData.length === 7 ? weeklyData : defaultChart }],
  };



  /* TRANSACTION SIGN */

  const getTxSign = (type:string) => {

    const creditTypes = ["EARN","BONUS","REFERRAL"];

    return creditTypes.includes(type) ? "+" : "-";

  };

      return (
    <ScrollView
      style={s.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
        {rewardPopup && (
        <View style={s.rewardPopup}>
          <Text style={s.rewardText}>+{rewardPopup} mins ⚡</Text>
        </View>
      )}

      <Text style={s.title}>{getGreeting(dashboard.name)}</Text>


      {/* BETA */}

      <View style={s.betaBox}>
        <Text style={s.betaText}>
          🧪 Beta Mode — Rewards are limited and may change.
        </Text>
      </View>

      {/* LIVE */}
        <View style={s.liveRow}>
    <View style={[s.liveDot, isEarning && s.livePulse]} />
    <Text style={s.liveText}>
      {isEarning ? "Earning now ⚡" : "Live earnings active"}
    </Text>
  </View>

        {/* ATC BALANCE */}

    <TouchableOpacity


style={[
  s.primaryCard,
  isEarning && s.earningCard
]}
      activeOpacity={0.9}
      onPress={()=>navigation.navigate("BuyUtility",{mode:"ATC_TO_AIRTIME"})}
    >
        <View style={s.balanceRow}>
          <Text style={s.primaryTitle}>ATC Balance</Text>

          <TouchableOpacity onPress={()=>setHideBalance(!hideBalance)}>
            <Ionicons
              name={hideBalance ? "eye-off-outline":"eye-outline"}
              size={20}
              color="#ccfbf1"
            />
          </TouchableOpacity>

        </View>

        <Text style={s.primaryBalance}>
          {hideBalance ? "••••••" : `${animatedATC.toFixed(6)} ATC`}
        </Text>

        <Text style={s.primaryHint}>
          Tap to buy airtime or data
        </Text>

        {price && !hideBalance && (
          <Text style={{ color: "#ccfbf1", marginTop: 4 }}>
            ≈ ₵{(animatedATC * price).toFixed(2)}
          </Text>
        )}

      </TouchableOpacity>

      {/* PRICE */}

      {price !== null && (

        <View style={s.card}>
          <Text style={s.cardTitle}>ATC Live Price</Text>
          <Text style={s.balance}>1 ATC = ₵{price.toFixed(4)}</Text>
        </View>

      )}

      {/* MINUTES */}

      <TouchableOpacity
        style={s.card}
        activeOpacity={0.85}
        onPress={()=>navigation.navigate("Convert")}
      >

        <View style={s.row}>
          <Text style={s.cardTitle}>Airtime Minutes</Text>

          <Ionicons
            name="swap-horizontal-outline"
            size={22}
            color="#0ea5a4"
          />

        </View>

        <Text style={s.balance}>
          {Math.floor(animatedMinutes)} mins
        </Text>

        <Text style={s.hint}>
        Today: {dashboard.todayMinutes} mins • ~₵
        {(dashboard.todayMinutes * (price || 0)).toFixed(2)}
      </Text>

      </TouchableOpacity> 

      {/* DAILY PROGRESS */}

      <View style={s.card}>

        <Text style={s.cardTitle}>Daily Earning Progress</Text>

        <View style={s.progressBg}>
          <View
            style={[
              s.progressFill,
              {
                width:`${Math.min((dashboard.todayMinutes/50)*100,100)}%`,
                backgroundColor:"#0ea5a4"
              }
            ]}
          />
        </View>

        <Text style={s.hint}>
          {dashboard.todayMinutes} / 50 mins earned today
        </Text>

      </View>

      

      {/* TRUST */}

      {dashboard.trustStatus && (

        <View style={s.trustCard}>

          <Text style={s.trustTitle}>
            Account Trust Level
          </Text>

          <View style={s.progressBg}>
            <View
              style={[
                s.progressFill,
                {
                  width:
                    dashboard.trustStatus === "good"
                      ? "100%"
                      : dashboard.trustStatus === "reduced"
                      ? "70%"
                      : dashboard.trustStatus === "limited"
                      ? "30%"
                      : "5%",

                  backgroundColor:
                    dashboard.trustStatus === "good"
                      ? "#22c55e"
                      : dashboard.trustStatus === "reduced"
                      ? "#f59e0b"
                      : "#ef4444"
                }
              ]}
            />
          </View>

          <Text style={s.trustHint}>
            Status: {dashboard.trustStatus.toUpperCase()}
          </Text>

        </View>

      )}

      {/* TOTAL EARNED */}

      <View style={s.card}>
        <Text style={s.cardTitle}>Total Earned</Text>

        <Text style={s.balance}>
          {Math.floor(animatedMinutes)} mins
        </Text>

        <Text style={s.hint}>Lifetime earnings</Text>
      </View>

      {/* WEEKLY CHART */}

      <View style={s.card}>

        <Text style={s.cardTitle}>Weekly Minutes</Text>

        <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          bezier
          chartConfig={{
            backgroundGradientFrom:"#fff",
            backgroundGradientTo:"#fff",
            color:(o)=>`rgba(14,165,164,${o})`,
            labelColor:()=>"#64748b"
          }}
          style={{marginTop:14,borderRadius:18}}
        />

      </View>

      {/* TRANSACTIONS */}

      <View style={s.card}>

        <Text style={s.cardTitle}>Recent Transactions</Text>

        
        {(!dashboard.recentTx || dashboard.recentTx.length === 0) && (
          <Text style={s.hint}>No transactions yet</Text>
        )}

        {(dashboard.recentTx || []).slice(0, 10).map(tx => (
          <View key={tx._id} style={s.txRow}>

            <Text>
              {getTxSign(tx.type)}
              {tx.amount} — {tx.source}
            </Text>

            <Text style={s.txDate}>
              {new Date(tx.createdAt).toLocaleString()}
            </Text>

          </View>
        ))}

      </View>

    </ScrollView>

  );

}

const s = StyleSheet.create({

container:{flex:1,padding:20,backgroundColor:"#fff"},
loader:{flex:1,justifyContent:"center",alignItems:"center"},
center:{flex:1,justifyContent:"center",alignItems:"center"},
title:{fontSize:26,fontWeight:"800",marginBottom:10},


betaBox:{backgroundColor:"#fff7ed",padding:10,borderRadius:8,marginBottom:12},
betaText:{fontSize:12,color:"#92400e"},

liveRow:{flexDirection:"row",alignItems:"center",marginBottom:12},
liveDot:{width:8,height:8,borderRadius:4,backgroundColor:"#22c55e",marginRight:6},
liveText:{fontSize:12,color:"#64748b"},

card:{backgroundColor:"#f8fafb",padding:16,borderRadius:18,marginBottom:14},

primaryCard:{backgroundColor:"#0ea5a4",padding:20,borderRadius:20,marginBottom:18},

balanceRow:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},

primaryTitle:{color:"#ecfeff",fontSize:14},
primaryBalance:{color:"#fff",fontSize:32,fontWeight:"900",marginTop:6},
primaryHint:{color:"#ccfbf1",fontSize:12,marginTop:6},

cardTitle:{fontSize:14,fontWeight:"600",color:"#475569"},
balance:{fontSize:28,fontWeight:"800",marginTop:6},
hint:{fontSize:12,color:"#64748b",marginTop:6},

row:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},

txRow:{marginTop:10},
txDate:{fontSize:11,color:"#64748b"},

trustCard:{backgroundColor:"#f8fafb",padding:16,borderRadius:16,marginBottom:16},
trustTitle:{fontWeight:"700",marginBottom:8},

progressBg:{height:10,backgroundColor:"#e5e7eb",borderRadius:999,overflow:"hidden"},
progressFill:{height:10,borderRadius:999},

trustHint:{marginTop:6,fontSize:12,color:"#64748b"},

rewardPopup: {
  position: "absolute",
  top: 90,
  left: 0,
  right: 0,
  alignItems: "center",
  zIndex: 999,
  elevation: 20,
},

rewardText: {
  color: "#4ade80",
  fontWeight: "800",
  fontSize: 18,
  backgroundColor: "rgba(0,0,0,0.6)",
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
},

livePulse: {
  backgroundColor: "#4ade80",
  shadowColor: "#4ade80",
  shadowOpacity: 1,
  shadowRadius: 12,
  elevation: 10,
  transform: [{ scale: 1.3 }],
},

earningCard: {
  transform: [{ scale: 1.07 }],
  shadowColor: "#0ea5a4",
  shadowOpacity: 0.6,
  shadowRadius: 12,
  elevation: 12,
},

});