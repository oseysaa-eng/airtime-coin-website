import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

interface EarningChartProps {
  earningsByDate: { [date: string]: number };
  earningsByType: { type: string; amount: number }[];
  onPiePress?: (type: string) => void;
}

export default function EarningChart({
  earningsByDate,
  earningsByType,
  onPiePress,
}: EarningChartProps) {
  const dateLabels = Object.keys(earningsByDate);
  const dateAmounts = Object.values(earningsByDate);

  return (
    <View>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Earnings Over Time</Text>

      <LineChart
        data={{
          labels: dateLabels,
          datasets: [{ data: dateAmounts }],
        }}
        width={screenWidth - 32}
        height={220}
        withDots
        withShadow
        withInnerLines={false}
        withOuterLines={false}
        bezier
        fromZero
        chartConfig={{
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          propsForDots: {
            r: '5',
            strokeWidth: '2',
            stroke: '#2980b9',
          },
        }}
        style={{
          marginVertical: 12,
          borderRadius: 16,
        }}
      />

      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Earnings by Type</Text>

      <PieChart
        data={earningsByType.map((item, index) => ({
          name: item.type,
          amount: item.amount,
          population: item.amount,
          color: pieColors[index % pieColors.length],
          legendFontColor: '#333',
          legendFontSize: 14,
        }))}
        width={screenWidth - 32}
        height={200}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        hasLegend
        avoidFalseZero
      />
    </View>
  );
}

const pieColors = [
  '#3498db', // Call
  '#2ecc71', // Referral
  '#e67e22', // Surveys
  '#9b59b6', // Games
  '#f1c40f', // Other
];

