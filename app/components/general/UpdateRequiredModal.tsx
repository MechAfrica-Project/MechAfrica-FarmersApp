import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Linking, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  isForce: boolean;
  message: string | null;
  storeUrl: string | null;
  onDismiss: () => void; // Only called if isForce is false
};

const mechAfricaLogo = require('../../../assets/images/mechafrica.png');

export default function UpdateRequiredModal({ visible, isForce, message, storeUrl, onDismiss }: Props) {
  const insets = useSafeAreaInsets();

  const handleUpdate = () => {
    if (storeUrl) {
      Linking.openURL(storeUrl).catch((err) => console.error("Couldn't load page", err));
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      // Hardware back button on Android
      onRequestClose={() => {
        if (!isForce) onDismiss();
      }}
    >
      <BlurView intensity={80} tint="dark" style={styles.absoluteFill}>
        <View style={styles.container}>
          <View style={[styles.card, { paddingBottom: insets.bottom + 24 }]}>
            <Image source={mechAfricaLogo} style={styles.logo} resizeMode="contain" />

            <Text style={styles.title}>
              {isForce ? 'Update Required' : 'Update Available'}
            </Text>

            <Text style={styles.message}>
              {message || "A new version of MechAfrica is available. Please update to continue getting the best experience."}
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
                  <Text style={styles.secondaryButtonText}>Later</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // fallback
  },
  container: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 24,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#FFEB3B', // MechAfrica Yellow
    shadowColor: '#FFEB3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000', // Deep Navy/Black
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
});
