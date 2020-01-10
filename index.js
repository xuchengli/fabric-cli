const chalk = require('chalk');
const figlet = require('figlet');
// const { createTopology } = require('./create-topology');
const installVPN = require('./installation/install-vpn');
const { logSuccess, logError, logTitle } = require('./lib/utils');

console.log(chalk.blueBright(figlet.textSync('Play with fabric blockchain', {
  font: 'ANSI Shadow',
  horizontalLayout: 'fitted'
})));

(async () => {
  try {
    logTitle('创建VPN');

    const result = await installVPN();
    logSuccess(JSON.stringify(result, null, 2));

    console.log('\n');
    logTitle('创建区块链网络');

    // createTopology().then(result => {
    //   logSuccess(result);
    // }).catch(err => {
    //   logError(err);
    // });
  } catch (err) {
    logError(err);
  }
})();
