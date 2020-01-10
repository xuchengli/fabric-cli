const chalk = require('chalk');
const figlet = require('figlet');
// const { createTopology } = require('./create-topology');
const installVPN = require('./installation/install-vpn');
const { logSuccess, logError, logTitle } = require('./lib/utils');

console.log(chalk.blueBright(figlet.textSync('Play with fabric blockchain', {
  font: 'ANSI Shadow',
  horizontalLayout: 'fitted'
})));

logTitle('创建VPN');

installVPN().then(result => {
  logSuccess(result);
}).catch(err => {
  logError(err);
});
// createTopology().then(result => {
//   logSuccess(result);
// }).catch(err => {
//   logError(err);
// });
