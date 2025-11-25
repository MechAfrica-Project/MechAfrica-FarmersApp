import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CustomToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning' | 'normal';
  title?: string;
  onDismiss?: () => void;
  actions?: Array<{
    label: string;
    onPress?: () => void;
    style?: 'default' | 'destructive' | 'primary';
  }>;
}

const getToastConfig = (type: CustomToastProps['type']) => {
  switch (type) {
    case 'success':
      return {
        icon: 'checkmark-circle' as const,
        color: '#059669', // Darker green for better contrast
        backgroundColor: '#ECFDF5',
        borderColor: '#A7F3D0',
        textColor: '#065F46', // Darker text for accessibility
      };
    case 'error':
      return {
        icon: 'close-circle' as const,
        color: '#DC2626', // Darker red for better contrast
        backgroundColor: '#FEF2F2',
        borderColor: '#FCA5A5',
        textColor: '#991B1B', // Darker text for accessibility
      };
    case 'warning':
      return {
        icon: 'warning' as const,
        color: '#D97706', // Darker orange for better contrast
        backgroundColor: '#FFFBEB',
        borderColor: '#FCD34D',
        textColor: '#92400E', // Darker text for accessibility
      };
    case 'info':
      return {
        icon: 'information-circle' as const,
        color: '#2563EB', // Darker blue for better contrast
        backgroundColor: '#EFF6FF',
        borderColor: '#93C5FD',
        textColor: '#1E40AF', // Darker text for accessibility
      };
    default:
      return {
        icon: 'information-circle-outline' as const,
        color: '#4B5563', // Darker gray for better contrast
        backgroundColor: '#F9FAFB',
        borderColor: '#D1D5DB',
        textColor: '#374151', // Darker text for accessibility
      };
  }
};

export const CustomToast: React.FC<CustomToastProps> = ({ message, type = 'normal', title, onDismiss, actions }) => {
  const config = getToastConfig(type);

  // Tapping anywhere on the toast should dismiss it (if dismiss handler provided)
  const handlePress = () => {
    try {
      if (onDismiss) onDismiss();
    } catch {}
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={title ? `${title}: ${message}` : message}
      accessibilityLiveRegion="polite"
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: config.backgroundColor, borderColor: config.borderColor, opacity: pressed ? 0.95 : 1 },
      ]}
    >
      <View style={styles.iconContainer} pointerEvents="none">
        <Ionicons name={config.icon} size={24} color={config.color} />
      </View>
      <View style={styles.textContainer} pointerEvents="box-none">
        {title && <Text style={[styles.title, { color: config.textColor }]}>{title}</Text>}
        <Text style={[styles.message, { color: config.textColor }]} numberOfLines={4} ellipsizeMode="tail">{message}</Text>

        {actions && actions.length > 0 && (
          <View style={styles.actionsContainer} pointerEvents="box-none">
            {actions.map((a, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  try {
                    a.onPress && a.onPress();
                  } catch {}
                  try {
                    if (onDismiss) onDismiss();
                  } catch {}
                }}
                style={({ pressed }) => [
                  styles.actionButton,
                  a.style === 'destructive' ? styles.actionDestructive : {},
                  a.style === 'primary' ? styles.actionPrimary : {},
                  { opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Text style={[styles.actionLabel, a.style === 'destructive' ? styles.actionLabelDestructive : {}, a.style === 'primary' ? styles.actionLabelPrimary : {}]}>{a.label}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
      {onDismiss && (
        <View style={styles.dismissButton} accessible accessibilityRole="button" accessibilityLabel="Dismiss notification">
          <Ionicons name="close" size={20} color={config.textColor} />
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Changed to flex-start to handle multi-line text better
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5, // Increased elevation for better visibility
    minHeight: 56,
    maxWidth: Platform.OS === 'web' ? '60%' : '90%', // Prevent toast from being too wide on large screens
  },
  iconContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontFamily: 'MulishSemiBold',
    fontSize: 14,
    marginBottom: 2,
    lineHeight: 20,
  },
  message: {
    fontFamily: 'MulishRegular',
    fontSize: 13,
    lineHeight: 18,
  },
  dismissButton: {
    padding: 6,
    marginTop: 2,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  actionsContainer: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  actionDestructive: {
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
  },
  actionPrimary: {
    backgroundColor: '#064E3B',
  },
  actionLabel: {
    fontFamily: 'MulishSemiBold',
    fontSize: 13,
    color: '#065F46',
  },
  actionLabelDestructive: {
    color: '#DC2626',
  },
  actionLabelPrimary: {
    color: '#FFFFFF',
  },
});
