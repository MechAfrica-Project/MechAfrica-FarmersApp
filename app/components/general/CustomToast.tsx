import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

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
				containerClasses: 'bg-emerald-50 border-emerald-200',
				textClass: 'text-emerald-700',
				iconColor: '#059669',
			};
		case 'error':
			return {
				icon: 'close-circle' as const,
				containerClasses: 'bg-red-50 border-red-200',
				textClass: 'text-red-700',
				iconColor: '#DC2626',
			};
		case 'warning':
			return {
				icon: 'warning' as const,
				containerClasses: 'bg-yellow-50 border-yellow-200',
				textClass: 'text-amber-800',
				iconColor: '#D97706',
			};
		case 'info':
			return {
				icon: 'information-circle' as const,
				containerClasses: 'bg-blue-50 border-blue-200',
				textClass: 'text-blue-700',
				iconColor: '#2563EB',
			};
		default:
			return {
				icon: 'information-circle-outline' as const,
				containerClasses: 'bg-gray-50 border-gray-200',
				textClass: 'text-gray-700',
				iconColor: '#4B5563',
			};
	}
};

const CustomToastInner: React.FC<CustomToastProps> = ({ message, type = 'normal', title, onDismiss, actions }) => {
	const config = useMemo(() => getToastConfig(type), [type]);
	const widthClass = Platform.OS === 'web' ? 'max-w-[60%]' : 'max-w-[90%]';

	const handlePress = useCallback(() => {
		try {
			onDismiss && onDismiss();
		} catch {}
	}, [onDismiss]);

	const renderActions = useMemo(() => {
		if (!actions || actions.length === 0) return null;
		return actions.map((a, i) => {
			const btnClasses = `py-1 px-3 rounded-md ${a.style === 'destructive' ? 'bg-red-50' : ''} ${a.style === 'primary' ? 'bg-emerald-800' : ''}`;
			const labelClasses = `${a.style === 'destructive' ? 'text-red-600' : a.style === 'primary' ? 'text-white' : config.textClass} font-MulishSemiBold text-sm`;
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

	return (
		<Pressable
			onPress={handlePress}
			accessibilityRole="button"
			accessibilityLabel={title ? `${title}: ${message}` : message}
			accessibilityLiveRegion="polite"
			className={`flex-row items-start px-4 py-3 rounded-lg border mx-4 my-1 shadow-md min-h-[56px] ${widthClass} ${config.containerClasses}`}
		>
			<View className="mr-3 pt-0.5" pointerEvents="none">
				<Ionicons name={config.icon} size={24} color={config.iconColor} />
			</View>

			<View className="flex-1 pr-2" pointerEvents="box-none">
				{title && <Text className={`font-MulishSemiBold text-sm mb-0.5 ${config.textClass}`}>{title}</Text>}
				<Text className={`font-MulishRegular text-sm leading-5 ${config.textClass}`} numberOfLines={4} ellipsizeMode="tail">{message}</Text>

				{actions && actions.length > 0 && (
					<View className="mt-2 flex-row items-center space-x-2">{renderActions}</View>
				)}
			</View>

			{onDismiss && (
				<View className="pt-0.5" accessible accessibilityRole="button" accessibilityLabel="Dismiss notification">
					<Ionicons name="close" size={20} color={config.iconColor} />
				</View>
			)}
		</Pressable>
	);
};

const CustomToast = React.memo(CustomToastInner);

export default CustomToast;
