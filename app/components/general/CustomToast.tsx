import React, { useCallback, useMemo } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ToastAction {
	label: string;
	onPress?: () => void;
	style?: 'default' | 'destructive' | 'primary';
}

interface CustomToastProps {
	message: string;
	type?: 'success' | 'error' | 'info' | 'warning' | 'normal';
	title?: string;
	onDismiss?: () => void;
	actions?: ToastAction[];
}

interface ToastConfig {
	icon: keyof typeof Ionicons.glyphMap;
	containerClasses: string;
	textClass: string;
	iconColor: string;
}

const getToastConfig = (type: CustomToastProps['type']): ToastConfig => {
	switch (type) {
		case 'success':
			return {
				icon: 'checkmark-circle',
				containerClasses: 'bg-green-50 border-green-200',
				textClass: 'text-green-800',
				iconColor: '#166534',
			};
		case 'error':
			return {
				icon: 'close-circle',
				containerClasses: 'bg-red-50 border-red-200',
				textClass: 'text-red-800',
				iconColor: '#DC2626',
			};
		case 'warning':
			return {
				icon: 'warning',
				containerClasses: 'bg-yellow-50 border-yellow-200',
				textClass: 'text-yellow-800',
				iconColor: '#D97706',
			};
		case 'info':
			return {
				icon: 'information-circle',
				containerClasses: 'bg-blue-50 border-blue-200',
				textClass: 'text-blue-800',
				iconColor: '#1E40AF',
			};
		default:
			return {
				icon: 'information-circle-outline',
				containerClasses: 'bg-gray-50 border-gray-200',
				textClass: 'text-gray-800',
				iconColor: '#1F2937',
			};
	}
};

const CustomToastInner: React.FC<CustomToastProps> = ({
	message,
	type = 'normal',
	title,
	onDismiss,
	actions
}) => {
	const config = useMemo(() => getToastConfig(type), [type]);
	const widthClass = Platform.OS === 'web' ? 'max-w-[60%]' : 'max-w-[90%]';

	const handleDismiss = useCallback(() => {
		onDismiss?.();
	}, [onDismiss]);

	const handleActionPress = useCallback((action: ToastAction) => {
		action.onPress?.();
		onDismiss?.();
	}, [onDismiss]);

	const renderAction = useCallback((action: ToastAction, index: number) => {
		const buttonStyle = {
			paddingVertical: 8,
			paddingHorizontal: 12,
			borderRadius: 6,
			borderWidth: 1,
			marginRight: 8,
			backgroundColor: action.style === 'destructive' ? '#FEF2F2' :
			               action.style === 'primary' ? '#059669' : '#F3F4F6',
			borderColor: action.style === 'destructive' ? '#FECACA' :
			            action.style === 'primary' ? '#059669' : '#D1D5DB',
		};
		const textStyle = {
			fontWeight: '600',
			fontSize: 14,
			color: action.style === 'destructive' ? '#B91C1C' :
			      action.style === 'primary' ? '#FFFFFF' : '#374151',
		};

		return (
			<Pressable
				key={`${action.label}-${index}`}
				onPress={() => handleActionPress(action)}
				style={buttonStyle}
				accessibilityRole="button"
				accessibilityLabel={action.label}
			>
				<Text style={textStyle}>{action.label}</Text>
			</Pressable>
		);
	}, [handleActionPress]);

	const accessibilityLabel = title ? `${title}: ${message}` : message;

	return (
		<Pressable
			onPress={handleDismiss}
			accessibilityRole="alert"
			accessibilityLabel={accessibilityLabel}
			accessibilityHint="Tap to dismiss"
			style={{
				flexDirection: 'row',
				alignItems: 'flex-start',
				padding: 16,
				borderRadius: 8,
				borderWidth: 1,
				marginHorizontal: 16,
				marginVertical: 4,
				minHeight: 56,
				maxWidth: Platform.OS === 'web' ? '60%' : '90%',
				backgroundColor: config.containerClasses.includes('emerald') ? '#ECFDF5' :
				                config.containerClasses.includes('red') ? '#FEF2F2' :
				                config.containerClasses.includes('yellow') ? '#FFFBEB' :
				                config.containerClasses.includes('blue') ? '#EFF6FF' : '#F9FAFB',
				borderColor: config.containerClasses.includes('emerald') ? '#D1FAE5' :
				            config.containerClasses.includes('red') ? '#FECACA' :
				            config.containerClasses.includes('yellow') ? '#FDE68A' :
				            config.containerClasses.includes('blue') ? '#DBEAFE' : '#F3F4F6',
				shadowColor: '#000',
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.1,
				shadowRadius: 4,
				elevation: 3,
			}}
		>
			<View style={{ marginRight: 12, marginTop: 2 }} pointerEvents="none">
				<Ionicons
					name={config.icon}
					size={20}
					color={config.iconColor}
					accessibilityElementsHidden
					importantForAccessibility="no"
				/>
			</View>

			<View style={{ flex: 1, paddingRight: 8 }} pointerEvents="box-none">
				{title && (
					<Text
						style={{
							fontWeight: '600',
							fontSize: 14,
							marginBottom: 4,
							color: config.textClass.includes('emerald') ? '#065F46' :
							      config.textClass.includes('red') ? '#DC2626' :
							      config.textClass.includes('amber') ? '#D97706' :
							      config.textClass.includes('blue') ? '#2563EB' : '#374151',
						}}
						accessibilityRole="header"
					>
						{title}
					</Text>
				)}
				<Text
					style={{
						fontSize: 14,
						lineHeight: 20,
						color: config.textClass.includes('emerald') ? '#065F46' :
						      config.textClass.includes('red') ? '#DC2626' :
						      config.textClass.includes('amber') ? '#D97706' :
						      config.textClass.includes('blue') ? '#2563EB' : '#374151',
					}}
					numberOfLines={4}
					ellipsizeMode="tail"
				>
					{message}
				</Text>

				{actions && actions.length > 0 && (
					<View style={{ flexDirection: 'row', marginTop: 12 }}>
						{actions.map(renderAction)}
					</View>
				)}
			</View>

			{onDismiss && (
				<Pressable
					onPress={handleDismiss}
					style={{ padding: 4, marginRight: -4 }}
					accessibilityRole="button"
					accessibilityLabel="Dismiss notification"
					hitSlop={8}
				>
					<Ionicons
						name="close"
						size={18}
						color={config.iconColor}
					/>
				</Pressable>
			)}
		</Pressable>
	);
};

const CustomToast = React.memo(CustomToastInner);
CustomToast.displayName = 'CustomToast';

export default CustomToast;
