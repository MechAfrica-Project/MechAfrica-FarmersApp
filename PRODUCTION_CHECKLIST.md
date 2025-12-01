# Production Deployment Checklist

## ✅ Completed Fixes

### 1. API URL Configuration
- ✅ Added validation in `lib/api.ts` to fail fast in production if URL not set
- ✅ Added validation in `lib/offlineQueue.ts` to skip processing if URL not configured
- ✅ Added warning messages in development mode

### 2. Google Maps API Keys
- ✅ Created `app.config.js` to read API keys from environment variables
- ✅ Maintained backward compatibility with existing keys in `app.json`
- ✅ Keys can now be set via `EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY` and `EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY`

### 3. Debug Statements
- ✅ Wrapped `console.debug()` statements in `__DEV__` checks in:
  - `stores/authStore.ts`
  - `stores/farmerStore.ts`
  - `lib/offlineQueue.ts`

### 4. Documentation
- ✅ Created `PRODUCTION_READINESS_REPORT.md` with comprehensive analysis
- ✅ Updated `README.md` with production deployment instructions
- ✅ Created this checklist

---

## ⚠️ ACTION REQUIRED Before Production

### 1. Set Environment Variables
Create a `.env` file in the project root (copy from `.env.example`):

```env
EXPO_PUBLIC_API_BASE_URL=https://your-production-api-url.com
EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY=your-ios-key
EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY=your-android-key
```

**Note:** The code supports both old variable names (`EXPO_PUBLIC_API_URL`, etc.) and new names (`EXPO_PUBLIC_API_BASE_URL`, etc.) for backward compatibility, but the new names are recommended.

**Important:** 
- ✅ All API keys are now read from `.env` file only - no hardcoded keys
- ✅ Do NOT commit `.env` to version control (already in `.gitignore`)
- ✅ Use different keys for development and production
- ✅ Restrict Google Maps API keys to your app's bundle IDs
- ✅ See `ENV_SETUP.md` for detailed setup instructions

### 2. Test Production Build
```bash
# Test with production environment variables
EXPO_PUBLIC_API_URL=https://api.mechafrica.com npx expo start

# Build for production
eas build --platform android --profile production
eas build --platform ios --profile production
```

### 3. Verify
- [ ] API calls work with production URL
- [ ] Google Maps loads correctly
- [ ] Authentication flow works end-to-end
- [ ] Offline functionality works
- [ ] No console.debug statements appear in production build
- [ ] App fails gracefully if API URL is not set

### 4. Security Review
- [ ] Google Maps API keys are restricted to your app bundle IDs
- [ ] API keys are not committed to version control
- [ ] Production API has proper authentication/authorization
- [ ] HTTPS is enforced for all API calls

---

## 📋 Pre-Deployment Verification

Run these checks before deploying:

1. **Environment Variables:**
   ```bash
   # Verify environment variables are set (use new names)
   echo $EXPO_PUBLIC_API_BASE_URL
   echo $EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY
   echo $EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY
   ```

2. **Build Test:**
   ```bash
   # Test build configuration
   npx expo config --type public
   ```

3. **API Connectivity:**
   - Test all API endpoints manually
   - Verify authentication works
   - Test error scenarios

4. **Device Testing:**
   - Test on physical iOS device
   - Test on physical Android device
   - Test offline scenarios
   - Test network reconnection

---

## 🚀 Deployment Steps

1. Set all environment variables
2. Run production build
3. Test on physical devices
4. Deploy to App Store / Google Play
5. Monitor for errors in production

---

## 📝 Notes

- The app now uses `app.config.js` instead of static `app.json` for configuration
- All critical issues have been addressed
- The app will fail fast in production if misconfigured (better than silent failures)
- Debug logging is automatically disabled in production builds

---

**Status:** Ready for production deployment after setting environment variables and testing.

