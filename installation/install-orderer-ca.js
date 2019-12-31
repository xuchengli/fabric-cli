const log = require('log-beautify');
const inquirer = require('inquirer');
const questions = require('../lib/questions');
const Server = require('../lib/server');
const Loader = require('../lib/loader');
const { parseVersion } = require('../lib/utils');
const { installDocker } = require('./install-docker');

async function installOrdererCA() {
  const ordererOrgCA = await inquirer.prompt(questions.orderer_org_ca);
  const { orderer_org_ca_host, orderer_org_ca_username, orderer_org_ca_password } = ordererOrgCA;

  const server = new Server(orderer_org_ca_host, orderer_org_ca_username, orderer_org_ca_password);

  const loader = new Loader();
  try {
    loader.process('正在连接中....');
    await server.checkConnection();
    loader.finish();
  } catch (err) {
    loader.finish();
    log.error(err.toString().split(':')[1].trim() + '，再试一下>>>>');
    return await installOrdererCA();
  }

  const profile = {};
  // 安装docker
  const dockerVersion = await installDocker(server);
  const { major, minor, patch } = parseVersion(dockerVersion);
  Object.assign(profile, { docker: `${major}.${minor}.${patch}` });

  return profile;
}
module.exports = { installOrdererCA };
