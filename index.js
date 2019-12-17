const log = require('log-beautify');
const chalk = require('chalk');
const figlet = require('figlet');
const inquirer = require('inquirer');
const Server = require('./lib/server');
const loader = require('./lib/loader');

log.useLabels = true;

async function installDocker() {
  loader.process();
  const server = new Server('106.75.66.107', 'root', '!Baas@test');
  await server.removeDocker(out => {
    loader.writeBuffer(out);
  }, err => {
    loader.writeBuffer(err);
  });
  const availableDockerVersions = await server.listAvailableDockerVersions('amd64',
    out => {
      loader.writeBuffer(out);
    },
    err => {
      loader.writeBuffer(err);
    }
  );
  log.debug(availableDockerVersions);
  await server.installDocker('5:18.09.9~3-0~ubuntu-xenial', out => {
    loader.writeBuffer(out);
  }, err => {
    loader.writeBuffer(err);
  });
  return await server.checkDocker();
}

console.log(chalk.blueBright(figlet.textSync('Play with fabric blockchain', {
  font: 'ANSI Shadow',
  horizontalLayout: 'fitted'
})));

inquirer.prompt([
  {
    type: 'input',
    name: 'name',
    message: "你的姓名是什么？"
  }
]).then(answers => {
  log.debug(answers);
  installDocker().then(result => {
    loader.finish();
    log.success(result);
  }).catch(err => {
    loader.finish();
    log.error(err);
  });
});
