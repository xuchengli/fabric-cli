const log = require('log-beautify');
const Server = require('./lib/server');

log.useLabels = true;

async function installDocker() {
  const server = new Server('106.75.66.107', 'root', '!Baas@test');
  await server.removeDocker(out => {
    console.log(out);
  }, err => {
    console.error(err);
  });
  const availableDockerVersions = await server.listAvailableDockerVersions('amd64',
    out => {
      console.log(out);
    },
    err => {
      console.error(err);
    }
  );
  log.debug(availableDockerVersions);
  await server.installDocker('5:18.09.9~3-0~ubuntu-xenial', out => {
    console.log(out);
  }, err => {
    console.error(err);
  });
  return await server.checkDocker();
}
installDocker().then(result => {
  log.success(result);
}).catch(err => {
  log.error(err);
});
