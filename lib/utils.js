function getTailNum(arr) {
  const tailNum = [];
  while (arr.length > 0) {
    const num = arr.pop().trim();
    if (!num || isNaN(num)) break;
    else tailNum.unshift(num);
  }
  return tailNum.join('');
}
function getHeadNum(arr) {
  const idx = arr.findIndex(num => isNaN(num));
  const headNum = arr.slice(0, idx >= 0 ? idx : arr.length);
  return headNum.join('');
}
function parseVersion(version) {
  const v_segment = version.split('.');
  const major = getTailNum([...v_segment[0]]);
  const minor = v_segment[1];
  const patch = getHeadNum([...v_segment[2]]);
  return { major, minor, patch };
}
function listVersion(raw) {
  return raw.split('\n').map(version => ({
    name: version.trim(),
    value: version.split('|')[1].trim(),
  }));
}
function findVersion(list, version) {
  return list.find(item => item.value.includes(version));
}
module.exports = { parseVersion, listVersion, findVersion };
