# Environment Variables Setup

## Required Environment Variables

All API keys and configuration must be set via environment variables. Create a `.env` file in the project root with the following variables:

## .env File Template

```env
# REQUIRED: Production API Base URL
# Example: https://api.mechafrica.com
# Do NOT include trailing slash
EXPO_PUBLIC_API_BASE_URL=https://api.mechafrica.com

# REQUIRED: Google Maps API Keys
# Get your keys from: https://console.cloud.google.com/google/maps-apis
# iOS Google Maps API Key
EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY=your-ios-maps-api-key-here

# Android Google Maps API Key  
EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY=your-android-maps-api-key-here
```

**Note:** The code also supports the old variable names (`EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY`, `EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY`) for backward compatibility, but the new names above are recommended.

## Setup Instructions

### 1. Create .env File

Create a `.env` file in the project root directory:

```bash
# On Windows (PowerShell)
New-Item -Path .env -ItemType File

# On Mac/Linux
touch .env
```

### 2. Add Your Values

Copy the template above and replace the placeholder values with your actual:
- Production API URL
- Google Maps iOS API key
- Google Maps Android API key

### 3. Verify .env is Ignored

The `.env` file is already in `.gitignore`, so it won't be committed to version control. **Never commit your `.env` file!**

### 4. Load Environment Variables

Expo automatically loads `.env` files. If you need to set them manually:

**Windows (PowerShell):**
```powershell
$env:EXPO_PUBLIC_API_BASE_URL="https://api.mechafrica.com"
$env:EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY="your-ios-key-here"
$env:EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY="your-android-key-here"
npx expo start
```

**Mac/Linux:**
```bash
export EXPO_PUBLIC_API_BASE_URL="https://api.mechafrica.com"
export EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY="your-ios-key-here"
export EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY="your-android-key-here"
npx expo start
```

## Security Notes

- ✅ All API keys are now read from environment variables only
- ✅ No hardcoded keys in the codebase
- ✅ `.env` file is in `.gitignore` (not committed)
- ⚠️ Never commit your `.env` file to version control
- ⚠️ Use different keys for development and production
- ⚠️ Restrict Google Maps API keys to your app's bundle IDs in Google Cloud Console

## Verification

After setting up your `.env` file, verify the configuration:

```bash
# Check if Expo can read the variables
npx expo config --type public
```

You should see your API URL and keys in the output (keys will be partially masked for security).

## Troubleshooting

### Keys Not Loading?

1. Make sure `.env` file is in the project root (same directory as `package.json`)
2. Restart Expo after creating/modifying `.env`
3. Check for typos in variable names (must start with `EXPO_PUBLIC_`)
4. Verify no extra spaces or quotes around values

### Google Maps Not Working?

1. Verify API keys are set correctly (check variable names match `.env.example`)
2. Check that keys are enabled in Google Cloud Console
3. Verify bundle IDs match in Google Cloud Console restrictions
4. Check console for warnings about missing keys
5. Ensure you're using the correct variable names:
   - `EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY` (not `EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY`)
   - `EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY` (not `EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY`)

