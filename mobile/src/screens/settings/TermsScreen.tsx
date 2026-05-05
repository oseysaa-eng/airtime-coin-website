import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

export default function TermsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Terms & Conditions</Text>

      <Text style={styles.section}>1. Acceptance of Terms</Text>
      <Text style={styles.text}>
        By accessing or using Airtime Coin (“ATC”), you agree to comply with these Terms & Conditions. 
        If you do not agree, you must not use the app.
      </Text>

      <Text style={styles.section}>2. Service Description</Text>
      <Text style={styles.text}>
        Airtime Coin is a digital rewards platform that allows users to earn virtual value (“ATC”) 
        through activities such as calls, ads, surveys, and other engagements.
      </Text>

      <Text style={styles.text}>
        ATC is not legal tender, not a bank deposit, and does not represent fiat currency.
      </Text>

      <Text style={styles.section}>3. Eligibility</Text>
      <Text style={styles.text}>
        You must be at least 18 years old or meet the legal age requirement in your country to use this app.
      </Text>

      <Text style={styles.section}>4. Account Responsibility</Text>
      <Text style={styles.text}>
        You are responsible for maintaining the confidentiality of your account, including your password 
        and device access. Any activity under your account is your responsibility.
      </Text>

      <Text style={styles.section}>5. Earning & Value</Text>
      <Text style={styles.text}>
        ATC earnings are subject to system rules, fraud detection, and reward limits. 
        The value of ATC may change at any time based on platform economics.
      </Text>

      <Text style={styles.section}>6. Withdrawals & KYC</Text>
      <Text style={styles.text}>
        Withdrawals may require identity verification (KYC). Airtime Coin reserves the right to approve, 
        delay, or reject withdrawals based on security checks, compliance requirements, or suspicious activity.
      </Text>

      <Text style={styles.section}>7. Fraud & Abuse</Text>
      <Text style={styles.text}>
        Any attempt to manipulate the system, including fake activity, automation, or abuse, may result in:
        {"\n"}• Account suspension
        {"\n"}• Loss of earnings
        {"\n"}• Permanent ban
      </Text>

      <Text style={styles.section}>8. Limitation of Liability</Text>
      <Text style={styles.text}>
        Airtime Coin is provided “as is” without warranties of any kind. We are not liable for any losses, 
        including loss of earnings, data, or access to the platform.
      </Text>

      <Text style={styles.section}>9. Service Availability</Text>
      <Text style={styles.text}>
        We may modify, suspend, or discontinue any part of the service at any time without notice.
      </Text>

      <Text style={styles.section}>10. Updates to Terms</Text>
      <Text style={styles.text}>
        These Terms may be updated at any time. Continued use of the app means you accept the updated terms.
      </Text>

      <Text style={styles.section}>11. Contact</Text>
      <Text style={styles.text}>
        For support or questions, contact us via the official Airtime Coin support channels.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 16,
  },
  section: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: "#334155",
  },
});