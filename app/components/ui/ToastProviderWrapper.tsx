import React from 'react';
import { ToastProvider } from 'react-native-toast-notifications';

export interface ToastProviderWrapperProps {
  children: React.ReactNode;
  placement?: 'top' | 'bottom';
  duration?: number;
  offsetTop?: number;
  offsetBottom?: number;
  animationType?: 'slide-in' | 'zoom-in' | 'none' | string;
  animationDuration?: number;
  swipeEnabled?: boolean;
  renderToast?: (toast: any) => React.ReactNode;
  successColor?: string;
  errorColor?: string;
  warningColor?: string;
  infoColor?: string;
  normalColor?: string;
}

export default function ToastProviderWrapper(props: ToastProviderWrapperProps) {
  const {
    children,
    placement,
    duration,
    offsetTop,
    offsetBottom,
    animationType,
    animationDuration,
    swipeEnabled,
    renderToast,
    successColor,
    errorColor,
    warningColor,
    infoColor,
    normalColor,
  } = props;

  return (
    <ToastProvider
      placement={placement}
      duration={duration}
      offsetTop={offsetTop}
      offsetBottom={offsetBottom}
      animationType={animationType as any}
      animationDuration={animationDuration}
      swipeEnabled={swipeEnabled}
      renderToast={renderToast as any}
      // color props intentionally not forwarded - CustomToast handles colors
    >
      {children}
    </ToastProvider>
  );
}
