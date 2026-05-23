module.exports.readVersion = function readVersion(contents) {
  return JSON.parse(contents).expo.version;
};

module.exports.writeVersion = function writeVersion(contents, version) {
  const json = JSON.parse(contents);
  json.expo.version = version;
  return `${JSON.stringify(json, null, 2)}\n`;
};
