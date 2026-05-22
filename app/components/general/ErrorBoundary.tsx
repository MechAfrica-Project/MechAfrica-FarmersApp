import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Updates from 'expo-updates';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (__DEV__) {
      console.error('Uncaught error:', error, errorInfo);
    }
    // TODO: Send to Sentry/Crashlytics in prod
  }

  handleRestart = async () => {
    try {
      await Updates.reloadAsync();
    } catch {
      // Fallback if reloadAsync is unavailable (e.g., in Expo Go)
      this.setState({ hasError: false, error: null });
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#EF4444', marginBottom: 12 }}>
            Something went wrong
          </Text>
          <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 24 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </Text>
          <TouchableOpacity 
            onPress={this.handleRestart}
            style={{ backgroundColor: '#059669', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
              Restart App
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
