// app.config.js - Dynamic configuration using environment variables
// This file replaces static app.json for production-ready configuration
// All API keys must be set via environment variables in .env file
// See .env.example for required variables

// Validate and load required environment variables
// Load a local .env file into process.env (simple parser, avoids adding dotenv dependency)
const fs = require('fs');
const path = require('path');
try {
  const envPath = path.resolve(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, 'utf8');
    raw.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const idx = trimmed.indexOf('=');
      if (idx === -1) return;
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    });
  }
} catch {}

const iosMapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY || '';
const androidMapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY || '';

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
    name: "MechAfrica Farmers App",
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
        NSLocationWhenInUseUsageDescription: "We need your location to show your farm location on the map."
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
      "expo-web-browser"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      // Expose API URL to the app (supports both old and new variable names for backward compatibility)
      apiUrl: process.env.EXPO_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_URL,
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_URL
    }
  }
};

