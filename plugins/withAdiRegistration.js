const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withAdiRegistration(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const platformRoot = config.modRequest.platformProjectRoot;
      const androidAssetsPath = path.join(platformRoot, 'app/src/main/assets');
      const sourceFilePath = path.join(
        config.modRequest.projectRoot,
        'assets/adi-registration.properties'
      );

      // Ensure the native assets directory exists
      await fs.promises.mkdir(androidAssetsPath, { recursive: true });

      if (fs.existsSync(sourceFilePath)) {
        await fs.promises.copyFile(
          sourceFilePath,
          path.join(androidAssetsPath, 'adi-registration.properties')
        );
        console.log(
          '✅ [withAdiRegistration] Successfully injected adi-registration.properties into native Android assets.'
        );
      } else {
        console.warn(
          '⚠️ [withAdiRegistration] assets/adi-registration.properties not found in project root. Skipping injection.'
        );
      }

      return config;
    },
  ]);
};
