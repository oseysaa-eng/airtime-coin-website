import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const faqs = [
  {
    question: 'How do I convert airtime to ATC?',
    answer: 'Go to the Home screen and tap "Convert Airtime" to start the process.',
  },
  {
    question: 'How do I withdraw my ATC?',
    answer: 'Visit the Withdraw section in the app and follow the instructions.',
  },
  {
    question: 'How can I verify my account?',
    answer: 'Complete the KYC process under the "Security & Privacy" section.',
  },
];

const HelpCenterScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Help Center / FAQs</Text>
      {faqs.map((faq, index) => (
        <View key={index} style={styles.faq}>
          <Text style={styles.question}>{faq.question}</Text>
          <Text style={styles.answer}>{faq.answer}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

export default HelpCenterScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  faq: { marginBottom: 20 },
  question: { fontSize: 16, fontWeight: '600' },
  answer: { fontSize: 14, color: '#555', marginTop: 5 },
});
