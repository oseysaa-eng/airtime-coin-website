import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

export default function PrivacyScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Privacy Policy</Text>

      <Text style={styles.text}>
        Airtime Coin ("we", "our", or "us") is committed to protecting your privacy. 
        This Privacy Policy explains how we collect, use, and protect your information 
        when you use our app.
      </Text>

      {/* ================= DATA COLLECTION ================= */}
      <Text style={styles.section}>1. Information We Collect</Text>

      <Text style={styles.text}>
        We may collect the following types of information:
      </Text>

      <Text style={styles.text}>
        • Personal Information: email address, phone number{"\n"}
        • Account Data: username, referral data, activity logs{"\n"}
        • Device Information: device ID, IP address, device type, OS{"\n"}
        • Usage Data: app interactions, earned minutes, transactions{"\n"}
        • KYC Data: ID documents and selfie (for verification purposes only)
      </Text>

      {/* ================= DATA USAGE ================= */}
      <Text style={styles.section}>2. How We Use Your Information</Text>

      <Text style={styles.text}>
        We use your information to:
      </Text>

      <Text style={styles.text}>
        • Provide and maintain the app{"\n"}
        • Process rewards and transactions{"\n"}
        • Verify identity (KYC){"\n"}
        • Detect and prevent fraud or abuse{"\n"}
        • Improve performance and user experience{"\n"}
        • Comply with legal and regulatory requirements
      </Text>

      {/* ================= DATA SHARING ================= */}
      <Text style={styles.section}>3. Data Sharing</Text>

      <Text style={styles.text}>
        We do not sell your personal data. However, we may share data with:
      </Text>

      <Text style={styles.text}>
        • Trusted service providers (e.g., analytics, hosting, KYC verification){"\n"}
        • Law enforcement or regulators when required by law{"\n"}
        • Partners necessary for providing services (e.g., payment providers)
      </Text>

      {/* ================= DATA STORAGE ================= */}
      <Text style={styles.section}>4. Data Storage & Security</Text>

      <Text style={styles.text}>
        Your data is stored securely using industry-standard encryption and access controls. 
        We take reasonable steps to protect your information from unauthorized access, loss, or misuse.
      </Text>

      {/* ================= DATA RETENTION ================= */}
      <Text style={styles.section}>5. Data Retention</Text>

      <Text style={styles.text}>
        We retain your data only as long as necessary to provide services, comply with legal obligations, 
        and resolve disputes.
      </Text>

      {/* ================= USER RIGHTS ================= */}
      <Text style={styles.section}>6. Your Rights</Text>

      <Text style={styles.text}>
        You may:
      </Text>

      <Text style={styles.text}>
        • Request access to your data{"\n"}
        • Request correction of inaccurate data{"\n"}
        • Request deletion of your account (subject to legal requirements)
      </Text>

      {/* ================= CHILDREN ================= */}
      <Text style={styles.section}>7. Children’s Privacy</Text>

      <Text style={styles.text}>
        Airtime Coin is not intended for users under the age of 18. 
        We do not knowingly collect data from children.
      </Text>

      {/* ================= CHANGES ================= */}
      <Text style={styles.section}>8. Changes to This Policy</Text>

      <Text style={styles.text}>
        We may update this Privacy Policy from time to time. Continued use of the app 
        means you accept any updates.
      </Text>

      {/* ================= CONTACT ================= */}
      <Text style={styles.section}>9. Contact Us</Text>

      <Text style={styles.text}>
        If you have any questions about this Privacy Policy, contact us at:
        {"\n"}support@airtimecoin.africa
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
    marginTop: 14,
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: "#334155",
  },
});