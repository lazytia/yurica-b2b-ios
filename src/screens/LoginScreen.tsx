import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView,
  Platform, TouchableWithoutFeedback, Keyboard, Animated, Easing, Vibration, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { supabase } from '../../lib/supabaseClient';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const [pin, setPin] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const focusInput = () => inputRef.current?.focus();
  const triggerShake = () => {
    Vibration.vibrate(50);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 40, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 40, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 35, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 35, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 30, easing: Easing.linear, useNativeDriver: true }),
    ]).start();
  };

  const handleChange = (v: string) => setPin(v.replace(/\D/g, '').slice(0, 4));

  const handleSubmit = async () => {
    if (pin.length < 4 || isSubmitting) return;
    setSubmitting(true);

    // ⚠️ 임시 통과 루트(동작 확인용). 디버그 끝나면 삭제 가능.
    if (pin === '3142') {
      navigation.navigate('Menu', { staffName: 'Tia' });
      setSubmitting(false);
      setPin('');
      return;
    }

    try {
      const { data, error } = await supabase.rpc('verify_pin_user', { p_pin: pin });
      Alert.alert('RPC result', `error: ${error?.message ?? 'none'}\ndata: ${JSON.stringify(data)}`);

      if (error) { triggerShake(); return; }
      const result = Array.isArray(data) ? data[0] : data;

      if (result?.ok) {
        navigation.navigate('Menu', { staffName: result.user_name ?? 'User' });
      } else {
        const locked = result?.locked_until ? `\nlocked_until: ${result.locked_until}` : '';
        Alert.alert('Invalid PIN', `Try again.${locked}`);
        triggerShake();
      }
    } catch (e: any) {
      Alert.alert('Submit Catch', e?.message ?? String(e));
      triggerShake();
    } finally {
      setSubmitting(false);
      setPin('');
      focusInput();
    }
  };

  const boxes = [0, 1, 2, 3];

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding' })} style={{ flex: 1, backgroundColor: '#0b1220' }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.brand}>YURICA</Text>
            <Text style={styles.subtitle}>PIN 로그인</Text>
          </View>

          <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>
            <TextInput
              ref={inputRef}
              value={pin}
              onChangeText={handleChange}
              keyboardType="number-pad"
              maxLength={4}
              autoFocus
              caretHidden
              secureTextEntry
              style={styles.hiddenInput}
            />

            <TouchableOpacity activeOpacity={0.9} onPress={focusInput} style={styles.pinArea}>
              <Text style={styles.label}>Enter 4-digit PIN</Text>
              <View style={styles.pinRow}>
                {boxes.map((i) => {
                  const filled = pin.length > i;
                  const isActive = pin.length === i;
                  return (
                    <View key={i} style={[styles.pinBox, isActive && styles.pinBoxActive]}>
                      <Text style={styles.pinChar}>{filled ? '•' : ''}</Text>
                    </View>
                  );
                })}
              </View>
              <Text style={styles.hint}>If you forgot your PIN, contact the manager.</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.9}
              disabled={pin.length !== 4 || isSubmitting}
              style={[
                styles.primaryBtn,
                pin.length === 4 && !isSubmitting ? styles.primaryBtnEnabled : styles.primaryBtnDisabled,
              ]}
            >
              <Text style={styles.primaryBtnText}>{isSubmitting ? 'Checking…' : 'Login'}</Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>© YuricaJapaneseKitchen</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const CARD_BG = '#101828';
const CARD_BORDER = 'rgba(255,255,255,0.08)';

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 22, paddingTop: 56, paddingBottom: 24, justifyContent: 'space-between' },
  header: { alignItems: 'center', gap: 6 },
  brand: { color: '#E5F0FF', fontSize: 28, fontWeight: '800', letterSpacing: 2 },
  subtitle: { color: 'rgba(229,240,255,0.7)', fontSize: 14 },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  hiddenInput: { position: 'absolute', opacity: 0, height: 0, width: 0 },
  pinArea: { alignItems: 'center', gap: 14, paddingVertical: 8 },
  label: { color: '#C7D7FF', fontSize: 16 },
  pinRow: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  pinBox: {
    width: 56, height: 56, borderRadius: 14, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)', backgroundColor: '#0B1220',
    alignItems: 'center', justifyContent: 'center',
  },
  pinBoxActive: {
    borderColor: '#5B8CFF', shadowColor: '#5B8CFF', shadowOpacity: 0.45, shadowRadius: 10, shadowOffset: { width: 0, height: 0 },
  },
  pinChar: { color: '#E6EEFF', fontSize: 24, fontWeight: '700' },
  hint: { color: 'rgba(229,240,255,0.6)', fontSize: 12, marginTop: 2 },
  primaryBtn: { marginTop: 18, borderRadius: 14, alignItems: 'center', paddingVertical: 14 },
  primaryBtnEnabled: { backgroundColor: '#3478F6' },
  primaryBtnDisabled: { backgroundColor: 'rgba(52,120,246,0.35)' },
  primaryBtnText: { color: 'white', fontWeight: '700', fontSize: 16, letterSpacing: 0.3 },
  footer: { alignItems: 'center' },
  footerText: { color: 'rgba(229,240,255,0.45)', fontSize: 12 },
});
