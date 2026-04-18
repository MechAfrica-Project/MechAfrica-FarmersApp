
const env = require('./lib/env.cjs');
env.loadDotenvSync();

const iosMapsKey = env.getGoogleMapsIosKey() || '';
const androidMapsKey = env.getGoogleMapsAndroidKey() || '';

// Warn if keys are missing (except in test environment)
if (!iosMapsKey && process.env.NODE_ENV !== 'test') {
  console.warn('⚠️ EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY not set! Google Maps will not work on iOS.');
  console.warn('   Set this in your .env file. See .env.example for reference.');
}

if (!androidMapsKey && process.env.NODE_ENV !== 'test') {
  console.warn('⚠️ EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY not set! Google Maps will not work on Android.');
  console.warn('   Set this in your .env file. See .env.example for reference.');
}

module.exports = {
  expo: {
    name: "Farmers App",
    slug: "mechafrica-farmers-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/mechafrica.png",
    scheme: "farmers",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      bundleIdentifier: "com.mechafrica.farmer",
      supportsTablet: true,
      config: {
        // Google Maps API key from EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY environment variable
        googleMapsApiKey: iosMapsKey
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "We need your location to show your farm location on the map.",
        "ITSAppUsesNonExemptEncryption": false
      }
      ,
      splash: {
        image: "./assets/images/mechafrica.png",
        resizeMode: "contain",
        backgroundColor: "#FCFF3B",
        dark: {
          image: "./assets/images/mechafrica.png",
          backgroundColor: "#000000"
        }
      }
    },
    android: {
      package: "com.mechafrica.farmer",
      adaptiveIcon: {
        foregroundImage: "./assets/images/mechafrica.png",
        backgroundColor: "#FCFF3B"
      },
      edgeToEdgeEnabled: true,
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ],
      config: {
        googleMaps: {
          // Google Maps API key from EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY environment variable
          apiKey: androidMapsKey
        }
      }
      ,
      splash: {
        image: "./assets/images/mechafrica.png",
        resizeMode: "contain",
        backgroundColor: "#FCFF3B",
        dark: {
          image: "./assets/images/mechafrica.png",
          backgroundColor: "#000000"
        }
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/mechafrica.png"
    },
    splash: {
      image: "./assets/images/mechafrica.png",
      resizeMode: "contain",
      backgroundColor: "#FCFF3B",
      dark: {
        image: "./assets/images/mechafrica.png",
        backgroundColor: "#000000"
      }
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#FCFF3B",
          image: "./assets/images/mechafrica.png",
          dark: {
            image: "./assets/images/mechafrica.png",
            backgroundColor: "#000000"
          },
          imageWidth: 200
        }
      ],
      "expo-secure-store",
      "expo-audio",
      "expo-font",
      "expo-web-browser",
      "@react-native-community/datetimepicker",
      "expo-updates",
      "./plugins/withAdiRegistration.js"
    ],
    experiments: {
      typedRoutes: true
    },
    "updates": {
      "url": "https://u.expo.dev/481cec85-cb63-4658-8d4f-7d240a57ff67"
    },
    "runtimeVersion": {
      "policy": "appVersion"
    },
    extra: {
      // Expose API URL to the app (supports both old and new variable names for backward compatibility)
      apiUrl: env.resolveApiUrlRaw() || null,
      apiBaseUrl: env.resolveApiUrlRaw() || null,
      "eas": {
        "projectId": "481cec85-cb63-4658-8d4f-7d240a57ff67"
      }
    },
    "owner": "mechafrica"
  }
};
