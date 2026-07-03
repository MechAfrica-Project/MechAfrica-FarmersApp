// app/components/general/ToastConfig.tsx
import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { BaseToastProps } from 'react-native-toast-message';
import { CheckCircle2, AlertTriangle, Info, Bell } from 'lucide-react-native';

// Create a unified premium Toast component
const PremiumToast = ({ type, props }: { type: 'success' | 'error' | 'info', props: BaseToastProps }) => {
  const isIOS = Platform.OS === 'ios';

  let icon = <Bell size={24} color="#3B82F6" strokeWidth={2.5} />;
  let tint: 'light' | 'dark' | 'default' = 'default';
  let borderLeftColor = '#3B82F6';
  
  if (type === 'success') {
    icon = <CheckCircle2 size={24} color="#10B981" strokeWidth={2.5} />;
    borderLeftColor = '#10B981';
    tint = 'light';
  } else if (type === 'error') {
    icon = <AlertTriangle size={24} color="#EF4444" strokeWidth={2.5} />;
    borderLeftColor = '#EF4444';
    tint = 'light';
  } else if (type === 'info') {
    icon = <Info size={24} color="#3B82F6" strokeWidth={2.5} />;
    borderLeftColor = '#3B82F6';
    tint = 'light';
  }

  const content = (
    <View style={[styles.container, !isIOS && styles.androidFallback]}>
      <View style={[styles.indicator, { backgroundColor: borderLeftColor }]} />
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.text1}>{props.text1}</Text>
        {props.text2 ? <Text style={styles.text2}>{props.text2}</Text> : null}
      </View>
    </View>
  );

  if (isIOS) {
    return (
      <BlurView intensity={70} tint={tint} style={styles.blurContainer}>
        {content}
      </BlurView>
    );
  }

  return <View style={styles.fallbackContainer}>{content}</View>;
};

export const toastConfig = {
  success: (props: any) => <PremiumToast type="success" props={props} />,
  error: (props: any) => <PremiumToast type="error" props={props} />,
  info: (props: any) => <PremiumToast type="info" props={props} />,
};

const styles = StyleSheet.create({
  blurContainer: {
    width: '90%',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  fallbackContainer: {
    width: '90%',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
    backgroundColor: '#ffffff',
    elevation: 4,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 16,
    minHeight: 64,
  },
  androidFallback: {
    backgroundColor: '#ffffff',
  },
  indicator: {
    width: 4,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  iconContainer: {
    paddingLeft: 16,
    paddingRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  text1: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  text2: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
});

export default toastConfig;
