const chalk = require('chalk');

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
function useUnicodeSymbols() {
  const env = process.env;
  return process.platform !== 'win32' || env.CI || env.TERM || env.TERM_PROGRAM;
}
function logSuccess(message, offset = 0) {
  const symbol = useUnicodeSymbols() ? ' ✔ ' : ' √ ';
  console.log(''.padStart(offset) + chalk.bgHex('#26FF5C').black(symbol + '成功 ') + ' ' + chalk.hex('#26FF5C')(message));
}
function logWarning(message, offset = 0) {
  const symbol = useUnicodeSymbols() ? ' ⚠ ' : ' ‼ ';
  console.log(''.padStart(offset) + chalk.bgHex('#FFC926').black(symbol + '警告 ') + ' ' + chalk.hex('#FFC926')(message));
}
function logError(message, offset = 0) {
  const symbol = useUnicodeSymbols() ? ' ✖ ' : ' × ';
  console.log(''.padStart(offset) + chalk.bgHex('#F55256').whiteBright(symbol + '错误 ') + ' ' + chalk.hex('#F55256')(message));
}
module.exports = { parseVersion, listVersion, findVersion, logSuccess, logWarning, logError };
