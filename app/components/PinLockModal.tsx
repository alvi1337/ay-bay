import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

interface PinLockModalProps {
  visible: boolean;
  onSuccess: () => void;
  isSetup?: boolean;
  onSetupComplete?: (pin: string) => void;
}

const LOGO_URL = 'https://d64gsuwffb70l.cloudfront.net/6949145e771bf6dd0007c3e0_1766397126688_a5d04e03.jpg';

export default function PinLockModal({
  visible,
  onSuccess,
  isSetup = false,
  onSetupComplete,
}: PinLockModalProps) {
  const { t } = useLanguage();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [error, setError] = useState('');

  const handleNumberPress = (num: string) => {
    setError('');
    if (step === 'enter' && pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (!isSetup && newPin.length === 4) {
        // Verify PIN (for demo, accept any 4-digit PIN)
        setTimeout(() => {
          onSuccess();
          setPin('');
        }, 300);
      } else if (isSetup && newPin.length === 4) {
        setStep('confirm');
      }
    } else if (step === 'confirm' && confirmPin.length < 4) {
      const newConfirmPin = confirmPin + num;
      setConfirmPin(newConfirmPin);
      if (newConfirmPin.length === 4) {
        if (newConfirmPin === pin) {
          onSetupComplete?.(pin);
          setPin('');
          setConfirmPin('');
          setStep('enter');
        } else {
          setError('PINs do not match. Try again.');
          setConfirmPin('');
        }
      }
    }
  };

  const handleDelete = () => {
    if (step === 'enter') {
      setPin(pin.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
    setError('');
  };

  const currentPin = step === 'enter' ? pin : confirmPin;

  const PinDot = ({ filled }: { filled: boolean }) => (
    <View style={[styles.pinDot, filled && styles.pinDotFilled]} />
  );

  const NumberButton = ({ num }: { num: string }) => (
    <TouchableOpacity
      style={styles.numberBtn}
      onPress={() => handleNumberPress(num)}
      activeOpacity={0.7}
    >
      <Text style={styles.numberText}>{num}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="fade">
      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={{ uri: LOGO_URL }} style={styles.logo} />
          <Text style={styles.appName}>{t('appName')}</Text>
        </View>

        <Text style={styles.title}>
          {isSetup
            ? step === 'enter'
              ? 'Create PIN'
              : 'Confirm PIN'
            : 'Enter PIN'}
        </Text>
        <Text style={styles.subtitle}>
          {isSetup
            ? step === 'enter'
              ? 'Create a 4-digit PIN to secure your app'
              : 'Re-enter your PIN to confirm'
            : 'Enter your 4-digit PIN to continue'}
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.pinContainer}>
          {[0, 1, 2, 3].map((i) => (
            <PinDot key={i} filled={currentPin.length > i} />
          ))}
        </View>

        <View style={styles.keypad}>
          <View style={styles.keypadRow}>
            <NumberButton num="1" />
            <NumberButton num="2" />
            <NumberButton num="3" />
          </View>
          <View style={styles.keypadRow}>
            <NumberButton num="4" />
            <NumberButton num="5" />
            <NumberButton num="6" />
          </View>
          <View style={styles.keypadRow}>
            <NumberButton num="7" />
            <NumberButton num="8" />
            <NumberButton num="9" />
          </View>
          <View style={styles.keypadRow}>
            <View style={styles.numberBtn} />
            <NumberButton num="0" />
            <TouchableOpacity
              style={styles.numberBtn}
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Ionicons name="backspace-outline" size={28} color="#1F2937" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.biometricBtn}>
          <Ionicons name="finger-print" size={32} color="#1E40AF" />
          <Text style={styles.biometricText}>Use Fingerprint</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 12,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E40AF',
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 8,
  },
  pinContainer: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: 32,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  pinDotFilled: {
    backgroundColor: '#1E40AF',
  },
  keypad: {
    width: '100%',
    maxWidth: 300,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  numberBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1F2937',
  },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  biometricText: {
    fontSize: 16,
    color: '#1E40AF',
    fontWeight: '600',
  },
});
