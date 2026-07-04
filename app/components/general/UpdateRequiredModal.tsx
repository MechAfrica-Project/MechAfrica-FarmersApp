import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Linking, Image, Animated, Easing, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  isForce: boolean;
  message: string | null;
  storeUrl: string | null;
  onDismiss: () => void;
};

const mechAfricaLogo = require('../../../assets/images/mechafrica.png');
const { height } = Dimensions.get('window');

export default function UpdateRequiredModal({ visible, isForce, message, storeUrl, onDismiss }: Props) {
  const insets = useSafeAreaInsets();
  
  // Animations
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(height);
      scaleAnim.setValue(0.95);
    }
  }, [visible]);

  const handleUpdate = () => {
    if (storeUrl) {
      Linking.openURL(storeUrl).catch((err) => console.error("Couldn't load page", err));
    }
  };

  const defaultMessage = isForce 
    ? "A critical update is required to continue using MechAfrica. We've made important improvements to ensure your app runs smoothly and securely."
    : "A newer, faster version of MechAfrica is waiting for you. Update now to explore the latest features and performance improvements.";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none" // Handled by custom Animated API
      statusBarTranslucent
      onRequestClose={() => {
        if (!isForce) onDismiss();
      }}
    >
      <View style={styles.overlayContainer}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
          <BlurView intensity={Platform.OS === 'ios' ? 70 : 100} tint="dark" style={StyleSheet.absoluteFill} />
        </Animated.View>

        <Animated.View 
          style={[
            styles.cardContainer,
            { 
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              opacity: fadeAnim,
              paddingBottom: Math.max(insets.bottom, 24)
            }
          ]}
        >
          <View style={styles.card}>
            <View style={styles.logoWrapper}>
              <View style={styles.logoGlow} />
              <Image source={mechAfricaLogo} style={styles.logo} resizeMode="contain" />
            </View>

            <Text style={styles.title}>
              {isForce ? 'Update Required' : 'New Update Available'}
            </Text>

            <Text style={styles.message}>
              {message || defaultMessage}
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleUpdate}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Update Now</Text>
              </TouchableOpacity>

              {!isForce && (
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={onDismiss}
                  activeOpacity={0.8}
                >
                  <Text style={styles.secondaryButtonText}>Maybe Later</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: '100%',
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 32,
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 20,
  },
  logoWrapper: {
    position: 'relative',
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255, 235, 59, 0.2)', // Yellow glow
    borderRadius: 50,
  },
  logo: {
    width: 65,
    height: 65,
  },
  title: {
    fontFamily: 'MulishBold',
    fontSize: 26,
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  message: {
    fontFamily: 'MulishRegular',
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 36,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    width: '100%',
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#FFEB3B', // MechAfrica Yellow
    shadowColor: '#FFEB3B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    fontFamily: 'MulishBold',
    fontSize: 17,
    color: '#1F2937',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontFamily: 'MulishSemiBold',
    fontSize: 16,
    color: '#9CA3AF',
  },
});
