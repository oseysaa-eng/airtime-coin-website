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
import { useAnimatedNumber } from "../hooks/useAnimatedNumber";
import { getGreeting } from "../utils/greeting";

import { useRef, useMemo } from "react";
import { useSocketEvent } from "../hooks/useSocket";


const screenWidth = Dimensions.get("window").width;


type Tx = {
  _id: string;
  type: string;
  amount: number;
  source: string;
  createdAt: string;
  streak: {
  current: number;
  longest: number;
};
  
};

  type Dashboard = {
  name: string;
  balance: number;
  balanceCedis: number;   // ✅ add
  totalMinutes: number;
  todayMinutes: number;
  todayATC: number;       // ✅ add
  weeklyMinutes: number[];
  weeklyATC: number[];    // ✅ add
  rate: number;           // ✅ add
  price: number;          // ✅ add
  recentTx: Tx[];
  trustStatus?: "excellent" | "reduced" | "limited" | "blocked";
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
  const popupTimeoutRef = useRef<any>(null);
  
  
  


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


  useEffect(() => {
  fetchDashboard();
}, []);

   /* ================= INIT ================= */
const handlePriceUpdate = useCallback((data: any) => {
  setDashboard(prev => {
    if (!prev) return prev;

    const newPrice = data.price;

    return {
      ...prev,
      price: newPrice,
      balanceCedis: prev.balance * newPrice,
      // optional but cleaner consistency
    };
  });
}, []);

useSocketEvent("PRICE_UPDATE", handlePriceUpdate);
  /* ================= SOCKET ================= */

    /* WALLET */

    const handleWalletUpdate = useCallback((data: any) => {

  // 🔥 trigger sync occasionally
  if (Date.now() - lastUpdateRef.current > 10000) {
    lastUpdateRef.current = Date.now();
    fetchDashboard();
  }

  setDashboard((prev: any) => {
    if (!prev) return prev;

    return {
      ...prev,
      balance: data.balance ?? prev.balance,
      totalMinutes:
        data.totalMinutes ?? prev.totalMinutes + (data.minutes || 0),
      todayMinutes:
        data.todayMinutes ?? prev.todayMinutes + (data.minutes || 0),
    };
  });

}, [fetchDashboard]);


    /* MINUTES */
const handleMinutesCredit = useCallback((data: any) => {
  const earned = data?.minutes || 0;
  if (!earned) return;

  if (popupTimeoutRef.current) {
    clearTimeout(popupTimeoutRef.current);
  }

  setRewardPopup((prev) => (prev ? prev + earned : earned));
  setIsEarning(true);

  popupTimeoutRef.current = setTimeout(() => {
    setRewardPopup(null);
    setIsEarning(false);
  }, 2000);
}, []);

useSocketEvent("WALLET_UPDATE", handleWalletUpdate);
useSocketEvent("MINUTES_CREDIT", handleMinutesCredit);


useEffect(() => {
  return () => {
    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current);
    }
  };
}, []);

/* ================= VALUES ================= */
  const atcValue = dashboard?.balance ?? 0;
  const minutesValue = dashboard?.totalMinutes ?? 0;



  const animatedATC = useAnimatedNumber(atcValue);
  const animatedMinutes = useAnimatedNumber(minutesValue);
  const trust = dashboard?.trustStatus || "blocked";
  const balanceCedis = dashboard?.balanceCedis ?? 0;

  /* ================= GROWTH METRICS ================= */

const formatMoney = (val: number) => {
  if (val === 0) return "0.00";
  if (val < 0.01) return val.toFixed(6);
  return val.toFixed(2);
};

const DAILY_TARGET = 50;
const remainingMinutes = Math.max(
  DAILY_TARGET - (dashboard?.todayMinutes ?? 0),
  0
);
const progressPercent = Math.min(
  ((dashboard?.todayMinutes ?? 0) / DAILY_TARGET) * 100,
  100
);

// 🔥 fake streak for now (replace later from backend)
const streakDays = dashboard?.streak?.current ?? 0;


  /* ================= CHART ================= */
    const weeklyData = useMemo(() => {
  return Array.isArray(dashboard?.weeklyMinutes) &&
    dashboard?.weeklyMinutes.length === 7
    ? dashboard.weeklyMinutes.map(n => Number(n) || 0)
    : defaultChart;
}, [dashboard?.weeklyMinutes]);

const chartData = useMemo(() => ({
  labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
  datasets: [{ data: weeklyData.map(n => Math.floor(n)) }]
}), [weeklyData]);


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




  /* TRANSACTION SIGN */

  const getTxSign = (type:string) => {

    const creditTypes = ["EARN","BONUS","REFERRAL"];

    return creditTypes.includes(type) ? "+" : "-";

  };


    const safePrice = dashboard?.price ?? 0;
    const safeTodayATC = dashboard?.todayATC ?? 0;
    const safeRate = dashboard?.rate ?? 0;
    const safeTodayMinutes = dashboard?.todayMinutes ?? 0;
    const safeBalanceCedis = dashboard?.balanceCedis ?? 0;

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
      
    <View style={[s.card, s.streakGlow]}>
  <Text style={s.cardTitle}>🔥 Streak</Text>

  

  <Text style={[s.balance, { color: "#f59e0b" }]}>
    {streakDays} days
  </Text>

  <Text style={s.hint}>
    Keep earning daily to grow your streak
  </Text>
</View>


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
      {isEarning
  ? "⚡ Earning in progress..."
  : "🚀 Start earning to increase your balance"}
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

  
            {dashboard?.price && !hideBalance && (
            <Text style={{ color: "#ccfbf1", marginTop: 4 }}>
              ≈ ₵{formatMoney(safeBalanceCedis)}
            </Text>
          )}
       
      </TouchableOpacity>

            <View style={s.card}>
          <Text style={s.cardTitle}>Today Earnings</Text>

        

          <Text style={[s.balance, { color: "#0ea5a4" }]}>
        {safeTodayATC.toFixed(4)} ATC
      </Text>

      <Text style={s.hint}>
        ≈ ₵{formatMoney(safeTodayATC * safePrice)}
      </Text>
        </View>

      {/* PRICE */}

      {dashboard?.price && !hideBalance && (
  <View style={s.card}>
    <Text style={s.cardTitle}>ATC Live Price</Text>
    <Text style={s.balance}>
      1 ATC = ₵{safePrice.toFixed(4)}
    </Text>
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
  Today: {dashboard.todayMinutes} mins •{" "}
  {(safeTodayMinutes * safeRate).toFixed(4)} ATC
</Text>

      </TouchableOpacity> 

      {(dashboard?.totalMinutes ?? 0) === 0 && (
  <Text style={[s.hint, { color: "#ef4444" }]}>
    ⚡ Start earning to see your rewards here
  </Text>
)}

      {/* DAILY PROGRESS */}

      <View style={s.card}>

        <Text style={s.cardTitle}>Daily Earning Progress</Text>

        <View style={s.progressBg}>
          <View
            style={[
              s.progressFill,
              {
                width: `${progressPercent}%`,
                backgroundColor:"#0ea5a4"
              }
            ]}
          />
        </View>

        <Text style={s.hint}>
          {dashboard.todayMinutes} / {DAILY_TARGET} mins earned today
        </Text>

      </View>

      <View style={s.card}>
  <Text style={s.cardTitle}>🎯 Next Reward</Text>

  {remainingMinutes > 0 ? (
    <>
      <Text style={s.balance}>
        {remainingMinutes} mins to go
      </Text>

      <Text style={s.hint}>
        Earn more to unlock full daily reward 🚀
      </Text>
    </>
  ) : (
    <>
      <Text style={[s.balance, { color: "#22c55e" }]}>
        🎉 Goal Reached!
      </Text>

      <Text style={s.hint}>
        You’ve maxed today’s earning
      </Text>
    </>
  )}
</View>


<TouchableOpacity
  style={{
    backgroundColor: "#0ea5a4",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  }}
  onPress={() => navigation.navigate("Earn")}
>
  <Text style={{ color: "#fff", fontWeight: "700" }}>
    🚀 Start Earning Now
  </Text>
</TouchableOpacity>

      

      {/* TRUST */}

      { trust && (

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
                    trust === "excellent"
                      ? "100%"
                      :  trust === "reduced"
                      ? "70%"
                      :  trust === "limited"
                      ? "30%"
                      : "5%",

                  backgroundColor:
                trust === "excellent"
                      ? "#22c55e"
                      : trust === "reduced"
                      ? "#f59e0b"
                      : "#ef4444"
                }
              ]}
            />
          </View>

          <Text style={s.trustHint}>
            Status: { trust.toUpperCase()}
          </Text>

        </View>


      )}

      {/* TOTAL EARNED */}

      <View style={s.card}>
        <Text style={s.cardTitle}>Lifetime Minutes</Text>

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

streakGlow: {
  shadowColor: "#f59e0b",
  shadowOpacity: 0.8,
  shadowRadius: 10,
  elevation: 10,
},

});