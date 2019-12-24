const inquirer = require('inquirer');
const questions = require('./questions');
const Loader = require('./loader');
const { parseVersion, listVersion, findVersion } = require('./utils');

async function installDocker(server, version) {
  const docker = await server.checkDocker();
  if (docker.includes('command not found')) {
    return await installFromBareMetal(server, version);
  } else {
    // TODO: 更新docker版本
  }
}
async function installFromBareMetal(server, version) {
  let availableVersionList = [];
  // 选择系统架构
  const archAnswer = await inquirer.prompt(questions.select_sys_arch);
  const loader = new Loader();
  try {
    loader.process();
    const rawVersions = await server.listAvailableDockerVersions(archAnswer.arch,
      out => {
        loader.writeBuffer(out);
      },
      err => {
        loader.writeBuffer(err);
      }
    );
    // 只列出18.09版本以上的docker
    availableVersionList = listVersion(rawVersions).filter(version => {
      const parsedVersion = parseVersion(version.value);
      const major = parseInt(parsedVersion.major);
      const minor = parseInt(parsedVersion.minor);
      return major > 18 || (major === 18 && minor >= 9);
    });
    // 如果需要安装的版本在可用版本列表中，则直接安装，不需要手动选择
    if (version) {
      const selVersion = findVersion(availableVersionList, version);
      if (selVersion) {
        await server.installDocker(selVersion.value, out => {
          loader.writeBuffer(out);
        }, err => {
          loader.writeBuffer(err);
        });
        return await server.checkDocker();
      }
    }
  } finally {
    loader.finish();
  }
  // 需要手动选择具体安装的版本
  const versionAnswer = await inquirer.prompt(questions.select_docker_version(availableVersionList));
  const installationLoader = new Loader();
  try {
    installationLoader.process();
    await server.installDocker(versionAnswer.docker_version, out => {
      installationLoader.writeBuffer(out);
    }, err => {
      installationLoader.writeBuffer(err);
    });
    return await server.checkDocker();
  } finally {
    installationLoader.finish();
  }
}
module.exports = { installDocker };
