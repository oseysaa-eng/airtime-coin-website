import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';

type OtpProps = {
  route: RouteProp<RootStackParamList, 'OtpVerification'>;
};

const OtpVerificationScreen: React.FC<OtpProps> = ({ route }) => {
  const { phone } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    if (!value && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp === '123456') {
      Alert.alert('✅ Success', 'OTP Verified!');
    } else {
      Alert.alert('❌ Invalid OTP', 'Please try again.');
    }
  };

  const handleResend = () => {
    if (resendTimer === 0) {
      Alert.alert('OTP Resent', `A new OTP has been sent to ${phone}.`);
      setResendTimer(30);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>Sent to {phone}</Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.otpBox}
              keyboardType="number-pad"
              maxLength={1}
              ref={(ref) => (inputs.current[index] = ref)}
              onChangeText={(value) => handleChange(value, index)}
              value={digit}
              returnKeyType="next"
              autoFocus={index === 0}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.verifyBtn,
            { backgroundColor: otp.every((d) => d !== '') ? '#1e90ff' : '#ccc' },
          ]}
          disabled={otp.some((d) => d === '')}
          onPress={handleVerify}
        >
          <Text style={styles.verifyText}>Verify</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleResend}
          disabled={resendTimer > 0}
          style={styles.resend}
        >
          <Text style={{ color: resendTimer > 0 ? '#999' : '#1e90ff' }}>
            {resendTimer > 0
              ? `Resend OTP in ${resendTimer}s`
              : 'Resend OTP'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

export default OtpVerificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    color: '#555',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  otpBox: {
    width: 45,
    height: 55,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#ccc',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  verifyBtn: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resend: {
    marginTop: 20,
    alignItems: 'center',
  },
});
