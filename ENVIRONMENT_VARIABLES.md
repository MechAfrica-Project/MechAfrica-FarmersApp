# Environment Variables Reference

## Overview

All API keys and configuration values are read from environment variables. The app uses clear, descriptive variable names following Expo's naming conventions.

## Required Variables

### API Configuration

| Variable Name | Description | Example | Required |
|--------------|-------------|---------|----------|
| `EXPO_PUBLIC_API_BASE_URL` | Your production API base URL (no trailing slash) | `https://api.mechafrica.com` | ✅ Yes |

**Backward Compatibility:** The old name `EXPO_PUBLIC_API_URL` is still supported but `EXPO_PUBLIC_API_BASE_URL` is recommended.

### Google Maps API Keys

| Variable Name | Description | Example | Required |
|--------------|-------------|---------|----------|
| `EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY` | iOS Google Maps API key | `AIzaSy...` | ✅ Yes (for iOS) |
| `EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY` | Android Google Maps API key | `AIzaSy...` | ✅ Yes (for Android) |

**Backward Compatibility:** Old names (`EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY`, `EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY`) are still supported but new names are recommended.

## Optional Variables

| Variable Name | Description | Default | Required |
|--------------|-------------|---------|----------|
| `EXPO_PUBLIC_DEBUG_MODE` | Enable debug logging | `false` | ❌ No |
| `EXPO_PUBLIC_API_TIMEOUT` | API request timeout in milliseconds | `30000` | ❌ No |

## Variable Naming Convention

All public environment variables follow Expo's convention:
- **Prefix:** `EXPO_PUBLIC_` (required for Expo to expose to client)
- **Format:** `UPPER_SNAKE_CASE`
- **Structure:** `EXPO_PUBLIC_[SERVICE]_[PLATFORM]_[TYPE]`

Examples:
- `EXPO_PUBLIC_API_BASE_URL` - API service, base URL type
- `EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY` - Google Maps service, iOS platform, API key type
- `EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY` - Google Maps service, Android platform, API key type

## Setup

1. Copy `.env.example` to `.env`
2. Fill in your actual values
3. Never commit `.env` to version control

See `ENV_SETUP.md` for detailed setup instructions.

## Verification

Check if variables are loaded:

```bash
# View Expo configuration
npx expo config --type public

# Or check specific variable (PowerShell)
$env:EXPO_PUBLIC_API_BASE_URL

# Or check specific variable (Bash)
echo $EXPO_PUBLIC_API_BASE_URL
```

## Migration from Old Names

If you're using old variable names, they still work, but consider migrating:

| Old Name | New Name (Recommended) |
|----------|----------------------|
| `EXPO_PUBLIC_API_URL` | `EXPO_PUBLIC_API_BASE_URL` |
| `EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY` | `EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY` |
| `EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY` | `EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY` |

The code checks for both old and new names, so migration can be done gradually.



