const log = require('log-beautify');
const chalk = require('chalk');
const figlet = require('figlet');
const inquirer = require('inquirer');
const questions = require('./lib/questions');
const Server = require('./lib/server');
const Loader = require('./lib/loader');
const utils = require('./lib/utils');

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

const dockerVersion = '18.09.9';
const server = new Server('106.75.66.107', 'root', '!Baas@test');

async function installDocker() {
  const docker = await server.checkDocker();
  if (docker.includes('command not found')) {
    // 选择系统架构，列出所有docker版本
    const archAnswer = await inquirer.prompt(questions.select_sys_arch);
    const loader = new Loader();
    loader.process();
    const rawVersions = await server.listAvailableDockerVersions(archAnswer.arch,
      out => {
        loader.writeBuffer(out);
      },
      err => {
        loader.writeBuffer(err);
      }
    );
    loader.finish();
    // 选择docker版本，安装对应版本的docker
    const choices = utils.listVersion(rawVersions);
    const selVersion = utils.findVersion(choices, dockerVersion);
    const versionAnswer = await inquirer.prompt(questions.select_docker_version(choices, selVersion.value));
    const loader2 = new Loader();
    loader2.process();
    await server.installDocker(versionAnswer.docker_version, out => {
      loader2.writeBuffer(out);
    }, err => {
      loader2.writeBuffer(err);
    });
    loader2.finish();
    return true;
  } else {
    return docker;
  }
}
installDocker().then(result => {
  log.success(result);
}).catch(err => {
  log.error(err);
});
