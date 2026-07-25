module.exports.readVersion = function readVersion(contents) {
  return JSON.parse(contents).expo.version;
};

module.exports.writeVersion = function writeVersion(contents, version) {
  const json = JSON.parse(contents);
  json.expo.version = version;
  
  // Auto-increment Android versionCode
  if (!json.expo.android) {
    json.expo.android = {};
  }
  json.expo.android.versionCode = (json.expo.android.versionCode || 1) + 1;
  
  return `${JSON.stringify(json, null, 2)}\n`;
};
