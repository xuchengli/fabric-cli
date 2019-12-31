const log = require('log-beautify');
const chalk = require('chalk');
const figlet = require('figlet');
const { createTopology } = require('./create-topology');

log.useLabels = true;

console.log(chalk.blueBright(figlet.textSync('Play with fabric blockchain', {
  font: 'ANSI Shadow',
  horizontalLayout: 'fitted'
})));

createTopology().then(result => {
  log.success(result);
}).catch(err => {
  log.error(err);
});
