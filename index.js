const log = require('log-beautify');
const chalk = require('chalk');
const figlet = require('figlet');
// const Server = require('./lib/server');
// const { installDocker } = require('./lib/install-docker');

log.useLabels = true;

console.log(chalk.blueBright(figlet.textSync('Play with fabric blockchain', {
  font: 'ANSI Shadow',
  horizontalLayout: 'fitted'
})));

// const server = new Server('106.75.66.107', 'root', '!Baas@test');

// installDocker(server, '18.09.5').then(result => {
//   log.success(result);
// }).catch(err => {
//   log.error(err);
// });

// server.checkDockerSwarm().then(result => {
//   const { LocalNodeState, Error } = JSON.parse(result);
//   if (LocalNodeState === 'inactive' && !Error) {
//     log.success('Docker Swarm可用>>>>');
//   }
// }).catch(err => {
//   log.error(err);
// });
