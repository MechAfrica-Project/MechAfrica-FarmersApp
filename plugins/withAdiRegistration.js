const { withAppBuildGradle, withProjectBuildGradle } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withAdiRegistration(config) {
  return withProjectBuildGradle(config, (config) => {
    // We are going to copy the file into android/app/src/main/assets
    // which is the standard place for native Android assets
    const androidAppPath = path.join(config.modRequest.projectRoot, 'android/app');
    const androidAssetsPath = path.join(androidAppPath, 'src/main/assets');
    const sourceFilePath = path.join(config.modRequest.projectRoot, 'assets/adi-registration.properties');

    if (!fs.existsSync(androidAssetsPath)) {
      fs.mkdirSync(androidAssetsPath, { recursive: true });
    }

    if (fs.existsSync(sourceFilePath)) {
      fs.copyFileSync(sourceFilePath, path.join(androidAssetsPath, 'adi-registration.properties'));
    } else {
      console.warn("⚠️ [withAdiRegistration] Cannot find assets/adi-registration.properties in project root.");
    }

    return config;
  });
};
