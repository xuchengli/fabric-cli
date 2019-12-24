const log = require('log-beautify');
const chalk = require('chalk');
const figlet = require('figlet');
const Server = require('./lib/server');
const { installDocker } = require('./lib/install-docker');

log.useLabels = true;

// await server.removeDocker(out => {
//   loader.writeBuffer(out);
// }, err => {
//   loader.writeBuffer(err);
// });

console.log(chalk.blueBright(figlet.textSync('Play with fabric blockchain', {
  font: 'ANSI Shadow',
  horizontalLayout: 'fitted'
})));

const server = new Server('106.75.66.107', 'root', '!Baas@test');

installDocker(server).then(result => {
  log.success(result);
}).catch(err => {
  log.error(err);
});
