const chalk = require('chalk');
const figlet = require('figlet');
const { createTopology } = require('./create-topology');
const { logSuccess, logError } = require('./lib/utils');

console.log(chalk.blueBright(figlet.textSync('Play with fabric blockchain', {
  font: 'ANSI Shadow',
  horizontalLayout: 'fitted'
})));

createTopology().then(result => {
  logSuccess(result);
}).catch(err => {
  logError(err);
});
