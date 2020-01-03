const inquirer = require('inquirer');
const questions = require('../lib/questions');
const Server = require('../lib/server');
const Loader = require('../lib/loader');
const profile = require('../lib/profile');
const { parseVersion, logSuccess, logWarning, logError } = require('../lib/utils');
const { installDocker } = require('./install-docker');
const { installSwarmLeader, telnetSwarmLeader, joinSwarm } = require('./install-docker-swarm');

async function installPeerOrgCA(number = 1) {
  const peerOrgCA = await inquirer.prompt(questions.peer_org_ca(number));
  const { peer_org_ca_host, peer_org_ca_username, peer_org_ca_password } = peerOrgCA;

  // 如果服务器已经安装了ca, 重新输入
  if (profile.orderer_org.ca === peer_org_ca_host || profile.peer_org.map(org => org.ca).includes(peer_org_ca_host)) {
    logWarning('该服务器已经安装了 CA，请重新选择服务器！', 7);
    return await installPeerOrgCA(number);
  }
  const server = new Server(peer_org_ca_host, peer_org_ca_username, peer_org_ca_password);

  const loader = new Loader();
  try {
    loader.process('正在连接中....');
    await server.checkConnection();
    loader.finish();
  } catch (err) {
    loader.finish();
    logError(err.toString().split(':')[1].trim() + '，再试一下>>>>', 7);
    return await installPeerOrgCA(number);
  }

  // 如果服务器没有安装docker和swarm，进行安装
  if (!profile.hosts.includes(peer_org_ca_host)) {
    const dockerVersion = await installDocker(server, profile.docker.length ? profile.docker[0] : '');
    const { major, minor, patch } = parseVersion(dockerVersion);
    const version = `${major}.${minor}.${patch}`;

    // 安装docker swarm leader或者加入swarm
    if (profile.hosts.length && profile.swarm_token) {
      // 检查swarm leader是否可以加入
      await telnetSwarmLeader(server, profile.hosts[0], 6);
      // 加入swarm
      await joinSwarm(server, profile.hosts[0], profile.swarm_token);
    } else {
      // 安装docker swarm leader
      const swarmToken = await installSwarmLeader(server);
      await server.createNetwork(profile.network);

      Object.assign(profile, { swarm_token: swarmToken });
    }

    // 更新profile
    profile.hosts.push(peer_org_ca_host);
    profile.docker.push(version);
  }
  // 更新profile
  profile.peer_org.push({
    ca: peer_org_ca_host,
    peers: [],
  });
  logSuccess('完成节点组织 CA 的安装！', 7);
}
module.exports = installPeerOrgCA;
