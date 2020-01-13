const inquirer = require('inquirer');
const questions = require('../lib/questions');
const Server = require('../lib/server');
const Loader = require('../lib/loader');
const profile = require('../lib/profile');
const { parseVersion, logSuccess, logWarning, logError, logSubtitle } = require('../lib/utils');
const { installDocker } = require('./install-docker');
// const { installSwarmLeader, telnetSwarmLeader, joinSwarm } = require('./install-docker-swarm');

async function installPeerOrgCA(number = 1) {
  const peerOrgCA = await inquirer.prompt(questions.peer_org_ca(number, 5));
  const { host, username, password } = peerOrgCA;

  // 如果服务器已经安装了ca, 重新输入
  if (profile.orderer_org.ca === host || profile.peer_org.map(org => org.ca).includes(host)) {
    logWarning('该服务器已经安装了 CA，请重新选择服务器！', 12);
    return await installPeerOrgCA(number);
  }
  const server = new Server(host, username, password);

  const loader = new Loader();
  try {
    loader.process('正在连接中....');
    await server.checkConnection();
    loader.finish();
  } catch (err) {
    loader.finish();
    logError(err.toString().split(':')[1].trim() + '，再试一下>>>>', 12);
    return await installPeerOrgCA(number);
  }

  // 如果服务器没有加入到区块链网络，则安装vpn client，docker，以及swarm.
  if (!profile.hosts.includes(host)) {
    logSubtitle('安装Docker', 12);
    const dockerVersion = await installDocker(server, profile.docker.length ? profile.docker[0] : '', 10);
    const { major, minor, patch } = parseVersion(dockerVersion);
    const version = `${major}.${minor}.${patch}`;
    logSuccess('安装Docker', 12);

    logSubtitle('配置VPN客户端', 12);
    const vpnLoader = new Loader();
    try {
      vpnLoader.process();
      await server.installVPNClient(profile.vpn.host, profile.vpn.psk, profile.vpn.user, profile.vpn.password,
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
      logError(err.toString().split(':')[1].trim() + '，再试一下>>>>', 12);
      return await installPeerOrgCA(number);
    }
    logSuccess('配置VPN客户端', 12);

    // 更新profile
    profile.hosts.push(host);
    profile.docker.push(version);
  }

  // 如果服务器没有安装docker和swarm，进行安装
  // if (!profile.hosts.includes(peer_org_ca_host)) {
  //   const dockerVersion = await installDocker(server, profile.docker.length ? profile.docker[0] : '');
  //   const { major, minor, patch } = parseVersion(dockerVersion);
  //   const version = `${major}.${minor}.${patch}`;
  //
  //   // 安装docker swarm leader或者加入swarm
  //   if (profile.hosts.length && profile.swarm_token) {
  //     // 检查swarm leader是否可以加入
  //     await telnetSwarmLeader(server, profile.hosts[0], 6);
  //     // 加入swarm
  //     await joinSwarm(server, profile.hosts[0], profile.swarm_token);
  //   } else {
  //     // 安装docker swarm leader
  //     const swarmToken = await installSwarmLeader(server);
  //     await server.createNetwork(profile.network);
  //
  //     Object.assign(profile, { swarm_token: swarmToken });
  //   }
  //
  //   // 更新profile
  //   profile.hosts.push(peer_org_ca_host);
  //   profile.docker.push(version);
  // }

  // 更新profile
  profile.peer_org.push({
    ca: host,
    peers: [],
  });
  logSuccess('完成节点组织 CA 的安装！', 12);
}
module.exports = installPeerOrgCA;
