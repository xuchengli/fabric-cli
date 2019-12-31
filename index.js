const log = require('log-beautify');
const chalk = require('chalk');
const figlet = require('figlet');
const { createTopology } = require('./create-topology');

log.useLabels = true;

console.log(chalk.blueBright(figlet.textSync('Play with fabric blockchain', {
  font: 'ANSI Shadow',
  horizontalLayout: 'fitted'
})));

// server.checkDockerSwarm().then(result => {
//   const { LocalNodeState, Error } = JSON.parse(result);
//   if (LocalNodeState === 'inactive' && !Error) {
//     log.success('Docker Swarm可用>>>>');
//   }
// }).catch(err => {
//   log.error(err);
// });

createTopology().then(result => {
  log.success(result);
}).catch(err => {
  log.error(err);
});
