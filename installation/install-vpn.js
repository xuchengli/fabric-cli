const inquirer = require('inquirer');
const questions = require('../lib/questions');
const Server = require('../lib/server');
const Loader = require('../lib/loader');
const { logSuccess, logError, logSubtitle } = require('../lib/utils');
const { installDocker } = require('./install-docker');

async function installVPN() {
  const vpn = await inquirer.prompt(questions.vpn);
  const { host, username, password } = vpn;

  const server = new Server(host, username, password);

  // 检查服务器是否可连接
  const loader = new Loader();
  try {
    loader.process('正在连接中....');
    await server.checkConnection();
    loader.finish();
  } catch (err) {
    loader.finish();
    logError(err.toString().split(':')[1].trim() + '，再试一下>>>>', 7);
    return await installVPN();
  }

  // 先安装docker
  logSubtitle('安装Docker', 7);
  await installDocker(server, '', 5);
  logSuccess('安装Docker', 7);

  // 然后安装IPsec VPN服务器
  logSubtitle('安装IPsec VPN服务', 7);
  const vpnLoader = new Loader();
  try {
    vpnLoader.process();
    await server.startIPsecVPN('ipsec-vpn-server',
      out => {
        vpnLoader.writeBuffer(out);
      },
      err => {
        vpnLoader.writeBuffer(err);
      }
    );
    vpnLoader.finish();
  } catch (err) {
    vpnLoader.finish();
    logError(err.toString().split(':')[1].trim() + '，再试一下>>>>', 7);
    return await installVPN();
  }
  logSuccess('安装IPsec VPN服务', 7);

  // 获取VPN服务器的PSK预共享密钥, VPN用户名, VPN密码
  const loginInfo = await server.fetchVPNLoginInfo('ipsec-vpn-server');

  return loginInfo;
}
module.exports = installVPN;
