import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  type: string;
  amount: number;
  date: string;
};

export default function TransactionItem({ type, amount, date }: Props) {
  return (
    <View style={styles.txItem}>
      <FontAwesome5 name="coins" size={20} color="#0ea5a4" />
      <View style={styles.txDetails}>
        <Text style={styles.txTitle}>{type}</Text>
        <Text style={styles.txDate}>{date}</Text>
      </View>
      <Text style={styles.txAmount}>₵{amount.toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
  },
  txDetails: {
    flex: 1,
    marginLeft: 12,
  },
  txTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  txDate: {
    fontSize: 12,
    color: '#777',
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5A55CA',
  },
});
