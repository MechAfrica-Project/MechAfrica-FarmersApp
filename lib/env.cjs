/* global require, module, __dirname, process */
/* global __dirname */
// CommonJS wrapper for environment helpers used by Node scripts (e.g., app.config.js)
const fs = require('fs');
const path = require('path');

// Default to MechAfrica backend if no explicit API URL is provided.
const API_URL_PLACEHOLDER = 'https://mechafrica-backend.up.railway.app';

function loadDotenvSync() {
  try {
    const envPath = path.resolve(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) return;
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
  } catch (_err) {
    // ignore
  }
}

function resolveApiUrlRaw() {
  return process.env.API_URL || process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_BASE_URL || null;
}

function getApiUrlOrPlaceholder() {
  const url = resolveApiUrlRaw();
  if (!url || url === API_URL_PLACEHOLDER) {
    if ((process.env.NODE_ENV || 'development') !== 'production') return API_URL_PLACEHOLDER;
    return API_URL_PLACEHOLDER;
  }
  return url.replace(/\/$/, '');
}

function getGoogleMapsIosKey() {
  return process.env.GOOGLE_MAPS_IOS_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY || '';
}

function getGoogleMapsAndroidKey() {
  return process.env.GOOGLE_MAPS_ANDROID_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY || '';
}

function getIntegrationPingPath() {
  return process.env.INTEGRATION_PING_PATH || process.env.EXPO_INTEGRATION_PING_PATH || '/health';
}

function runIntegrationTestsFlag() {
  return String(process.env.RUN_INTEGRATION || '').toLowerCase() === 'true';
}

function getNodeEnv() {
  return process.env.NODE_ENV || 'development';
}

module.exports = {
  loadDotenvSync,
  resolveApiUrlRaw,
  getApiUrlOrPlaceholder,
  API_URL_PLACEHOLDER,
  getGoogleMapsIosKey,
  getGoogleMapsAndroidKey,
  getIntegrationPingPath,
  runIntegrationTestsFlag,
  getNodeEnv,
};
