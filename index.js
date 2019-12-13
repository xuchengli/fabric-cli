const log = require('log-beautify');
const Server = require('./lib/server');

log.useLabels = true;

const server = new Server('39.104.189.169', 'root', 'Baas-mgt-passw0rd');
server.checkDocker().then(result => {
  log.success(result);
}).catch(err => {
  log.error(err);
});

const server2 = new Server('39.104.51.94', 'root', 'Baas-mgt-passw0rd');
server2.checkDocker().then(result => {
  log.success(result);
}).catch(err => {
  log.error(err);
});

const server3 = new Server('106.75.36.113', 'root', '!Baas@test');
server3.checkDocker().then(result => {
  log.success(result);
}).catch(err => {
  log.error(err);
});

const server4 = new Server('106.75.70.223', 'root', '!Baas@test');
server4.removeDocker().then(result => {
  log.debug(result);
}).catch(err => {
  log.error(err);
});
