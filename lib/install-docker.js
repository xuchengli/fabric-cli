const inquirer = require('inquirer');
const questions = require('./questions');
const Loader = require('./loader');
const { parseVersion, listVersion, findVersion } = require('./utils');

async function installDocker(server, version) {
  const docker = await server.checkDocker();
  if (docker.includes('command not found')) {
    return await installFromBareMetal(server, version);
  } else {
    return await updateDocker(server, docker, version);
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
async function updateDocker(server, originalVersion, updateVersion) {
  const parsedOriginalVersion = parseVersion(originalVersion);
  const major = parseInt(parsedOriginalVersion.major);
  const minor = parseInt(parsedOriginalVersion.minor);
  if (updateVersion) {
    const parsedUpdateVersion = parseVersion(updateVersion);
    if (major === parseInt(parsedUpdateVersion.major)) {
      // 已经存在的docker主版本号与需要安装的docker主版本一致，不需要安装
      return originalVersion;
    }
  } else if (major > 18 || (major === 18 && minor >= 9)) {
    // 已经存在的docker版本高于18.09，不需要安装
    return originalVersion;
  }
  // 确认是否需要更新docker版本
  const dockerUpdateAnswer = await inquirer.prompt(questions.confirm_docker_update);
  if (dockerUpdateAnswer.toBeUpdated) {
    // 重新安装docker版本，首先删除老版本
    const loader = new Loader();
    try {
      loader.process();
      await server.removeDocker(out => {
        loader.writeBuffer(out);
      }, err => {
        loader.writeBuffer(err);
      });
    } finally {
      loader.finish();
    }
    // 然后从裸机安装
    return await installFromBareMetal(server, updateVersion);
  }
  return await server.checkDocker();
}
module.exports = { installDocker };
