import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo } from 'react';
import { Platform, Pressable, Text, View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

interface CustomToastProps {
	message: string;
	type?: 'success' | 'error' | 'info' | 'warning' | 'normal';
	title?: string;
	onDismiss?: () => void;
	actions?: {
		label: string;
		onPress?: () => void;
		style?: 'default' | 'destructive' | 'primary';
	}[];
}

const getToastConfig = (type: CustomToastProps['type']) => {
	switch (type) {
		case 'success':
			return {
				icon: 'checkmark-circle' as const,
				containerClasses: 'bg-emerald-50/90 border-emerald-200/50',
				textClass: 'text-emerald-800',
				iconColor: '#059669',
				tint: 'light' as const,
			};
		case 'error':
			return {
				icon: 'close-circle' as const,
				containerClasses: 'bg-red-50/90 border-red-200/50',
				textClass: 'text-red-800',
				iconColor: '#DC2626',
				tint: 'light' as const,
			};
		case 'warning':
			return {
				icon: 'warning' as const,
				containerClasses: 'bg-yellow-50/90 border-yellow-200/50',
				textClass: 'text-amber-900',
				iconColor: '#D97706',
				tint: 'light' as const,
			};
		case 'info':
			return {
				icon: 'information-circle' as const,
				containerClasses: 'bg-blue-50/90 border-blue-200/50',
				textClass: 'text-blue-800',
				iconColor: '#2563EB',
				tint: 'light' as const,
			};
		default:
			return {
				icon: 'information-circle-outline' as const,
				containerClasses: 'bg-gray-50/90 border-gray-200/50',
				textClass: 'text-gray-800',
				iconColor: '#4B5563',
				tint: 'light' as const,
			};
	}
};

const CustomToastInner: React.FC<CustomToastProps> = ({ message, type = 'normal', title, onDismiss, actions }) => {
	const config = useMemo(() => getToastConfig(type), [type]);
	const widthClass = Platform.OS === 'web' ? 'max-w-[60%]' : 'max-w-[90%]';
	const isIOS = Platform.OS === 'ios';

	const handlePress = useCallback(() => {
		try {
			onDismiss && onDismiss();
		} catch {}
	}, [onDismiss]);

	const renderActions = useMemo(() => {
		if (!actions || actions.length === 0) return null;
		return actions.map((a, i) => {
			const btnClasses = `py-1.5 px-4 rounded-full ${a.style === 'destructive' ? 'bg-red-100' : ''} ${a.style === 'primary' ? 'bg-emerald-600' : ''}`;
			const labelClasses = `${a.style === 'destructive' ? 'text-red-700' : a.style === 'primary' ? 'text-white' : config.textClass} font-MulishSemiBold text-sm`;
			const onPress = () => {
				try { a.onPress && a.onPress(); } catch {}
				try { onDismiss && onDismiss(); } catch {}
			};
			return (
				<Pressable key={i} onPress={onPress} className={btnClasses}>
					<Text className={labelClasses}>{a.label}</Text>
				</Pressable>
			);
		});
	}, [actions, config.textClass, onDismiss]);

	const content = (
		<Pressable
			onPress={handlePress}
			accessibilityRole="button"
			accessibilityLabel={title ? `${title}: ${message}` : message}
			accessibilityLiveRegion="polite"
			className={`flex-row items-center px-4 py-3 min-h-[64px]`}
		>
			<View className="mr-3" pointerEvents="none">
				<Ionicons name={config.icon} size={28} color={config.iconColor} />
			</View>

			<View className="flex-1 pr-2 justify-center" pointerEvents="box-none">
				{title && <Text className={`font-MulishBold text-[15px] mb-0.5 ${config.textClass}`}>{title}</Text>}
				<Text className={`font-MulishMedium text-[14px] leading-5 ${config.textClass}`} numberOfLines={4} ellipsizeMode="tail">{message}</Text>

				{actions && actions.length > 0 && (
					<View className="mt-2.5 flex-row items-center space-x-2">{renderActions}</View>
				)}
			</View>

			{onDismiss && (
				<View className="pl-2 py-1" accessible accessibilityRole="button" accessibilityLabel="Dismiss notification">
					<Ionicons name="close" size={22} color={config.iconColor} />
				</View>
			)}
		</Pressable>
	);

	if (isIOS) {
		return (
			<View style={styles.shadow} className={`mx-4 my-2 rounded-2xl overflow-hidden border ${config.containerClasses} ${widthClass}`}>
				<BlurView intensity={65} tint={config.tint} style={StyleSheet.absoluteFill} />
				{content}
			</View>
		);
	}

	return (
		<View style={styles.shadow} className={`mx-4 my-2 rounded-2xl overflow-hidden border ${config.containerClasses} bg-white ${widthClass}`}>
			{content}
		</View>
	);
};

const styles = StyleSheet.create({
	shadow: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.12,
		shadowRadius: 16,
		elevation: 6,
	}
});

const CustomToast = React.memo(CustomToastInner);

export default CustomToast;
