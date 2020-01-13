const chalk = require('chalk');
const figlet = require('figlet');
const createTopology = require('./create-topology');
const installVPN = require('./installation/install-vpn');
const { logSuccess, logError, logTitle } = require('./lib/utils');

console.log(chalk.blueBright(figlet.textSync('Play with fabric blockchain', {
  font: 'ANSI Shadow',
  horizontalLayout: 'fitted'
})));

(async () => {
  try {
    logTitle('创建VPN');

    await installVPN();

    console.log('\n');
    logTitle('创建区块链网络');

    const result = await createTopology();

    logSuccess(JSON.stringify(result, null, 2));
  } catch (err) {
    logError(err);
  }
})();
