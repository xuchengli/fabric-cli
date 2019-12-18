function listVersion(raw) {
  return raw.split('\n').map(version => ({
    name: version.trim(),
    value: version.split('|')[1].trim(),
  }));
}
function findVersion(list, version) {
  return list.find(item => item.value.includes(version));
}
module.exports = { listVersion, findVersion };
