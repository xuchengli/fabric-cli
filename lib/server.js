const NodeSSH = require('node-ssh');
const Telnet = require('telnet-client');
const fs = require('fs');
const path = require('path');

class Server {
  constructor(host, username, password, port = 22) {
    this.host = host;
    this.username = username;
    this.password = password;
    this.port = port;
  }
  async checkConnection() {
    const sshClient = new NodeSSH();
    try {
      await sshClient.connect({
        host: this.host,
        username: this.username,
        port: this.port,
        password: this.password,
        readyTimeout: 5000,
      });
    } finally {
      await sshClient.dispose();
    }
  }
  async checkDocker() {
    const sshClient = new NodeSSH();
    try {
      await sshClient.connect({
        host: this.host,
        username: this.username,
        port: this.port,
        password: this.password,
      });
      return await sshClient.exec('docker -v');
    } catch (err) {
      if (err.toString().includes('command not found')) {
        return err.toString();
      }
      throw err;
    } finally {
      await sshClient.dispose();
    }
  }
  async removeDocker(stdout, stderr) {
    const sshClient = new NodeSSH();
    try {
      await sshClient.connect({
        host: this.host,
        username: this.username,
        port: this.port,
        password: this.password,
      });
      await sshClient.exec('apt-get purge -y docker-engine docker docker.io docker-ce', [], {
        onStdout: chunk => stdout(chunk.toString('utf8')),
        onStderr: chunk => stderr(chunk.toString('utf8')),
      });
      await sshClient.exec('apt-get autoremove -y --purge docker-engine docker docker.io docker-ce', [], {
        onStdout: chunk => stdout(chunk.toString('utf8')),
        onStderr: chunk => stderr(chunk.toString('utf8')),
      });
      const dockerBin = await sshClient.exec('which docker');
      if (dockerBin) {
        await sshClient.exec(`rm ${dockerBin}`, [], {
          onStdout: chunk => stdout(chunk.toString('utf8')),
          onStderr: chunk => stderr(chunk.toString('utf8')),
        });
      }
    } finally {
      await sshClient.dispose();
    }
  }
  async listAvailableDockerVersions(arch, stdout, stderr) {
    const sshClient = new NodeSSH();
    try {
      await sshClient.connect({
        host: this.host,
        username: this.username,
        port: this.port,
        password: this.password,
      });
      await sshClient.exec('apt-get update', [], {
        onStdout: chunk => stdout(chunk.toString('utf8')),
        onStderr: chunk => stderr(chunk.toString('utf8')),
      });
      await sshClient.exec(
        'DEBIAN_FRONTEND=noninteractive apt-get install -y apt-transport-https ca-certificates curl gnupg-agent software-properties-common',
        [],
        {
          onStdout: chunk => stdout(chunk.toString('utf8')),
          onStderr: chunk => stderr(chunk.toString('utf8')),
        }
      );
      await sshClient.exec('curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -', [], {
        onStdout: chunk => stdout(chunk.toString('utf8')),
        onStderr: chunk => stderr(chunk.toString('utf8')),
      });
      await sshClient.exec(
        'add-apt-repository "deb [arch=' + arch + '] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"',
        [],
        {
          onStdout: chunk => stdout(chunk.toString('utf8')),
          onStderr: chunk => stderr(chunk.toString('utf8')),
        }
      );
      await sshClient.exec('apt-get update', [], {
        onStdout: chunk => stdout(chunk.toString('utf8')),
        onStderr: chunk => stderr(chunk.toString('utf8')),
      });
      return await sshClient.exec('apt-cache madison docker-ce');
    } finally {
      await sshClient.dispose();
    }
  }
  async installDocker(version, stdout, stderr) {
    const sshClient = new NodeSSH();
    try {
      await sshClient.connect({
        host: this.host,
        username: this.username,
        port: this.port,
        password: this.password,
      });
      await sshClient.exec(
        'DEBIAN_FRONTEND=noninteractive apt-get install -y --allow-downgrades docker-ce=' + version + ' docker-ce-cli=' + version + ' containerd.io',
        [],
        {
          onStdout: chunk => stdout(chunk.toString('utf8')),
          onStderr: chunk => stderr(chunk.toString('utf8')),
        }
      );
    } finally {
      await sshClient.dispose();
    }
  }
  async checkDockerSwarm() {
    const sshClient = new NodeSSH();
    try {
      await sshClient.connect({
        host: this.host,
        username: this.username,
        port: this.port,
        password: this.password,
      });
      return await sshClient.exec(`docker info -f '{{json .Swarm}}'`);
    } finally {
      await sshClient.dispose();
    }
  }
  async leaveDockerSwarm() {
    const sshClient = new NodeSSH();
    try {
      await sshClient.connect({
        host: this.host,
        username: this.username,
        port: this.port,
        password: this.password,
      });
      return await sshClient.exec('docker swarm leave -f');
    } finally {
      await sshClient.dispose();
    }
  }
  async initDockerSwarm() {
    const sshClient = new NodeSSH();
    try {
      await sshClient.connect({
        host: this.host,
        username: this.username,
        port: this.port,
        password: this.password,
      });
      return await sshClient.exec(`docker swarm init --advertise-addr ${this.host}`);
    } finally {
      await sshClient.dispose();
    }
  }
  async getDockerSwarmToken() {
    const sshClient = new NodeSSH();
    try {
      await sshClient.connect({
        host: this.host,
        username: this.username,
        port: this.port,
        password: this.password,
      });
      return await sshClient.exec('docker swarm join-token -q manager');
    } finally {
      await sshClient.dispose();
    }
  }
  async joinDockerSwarm(leader_host, token) {
    const sshClient = new NodeSSH();
    try {
      await sshClient.connect({
        host: this.host,
        username: this.username,
        port: this.port,
        password: this.password,
      });
      return await sshClient.exec(`docker swarm join --token ${token} ${leader_host}:2377`);
    } finally {
      await sshClient.dispose();
    }
  }
  async telnetDockerSwarmLeader(leader_host) {
    const telnet = new Telnet();
    try {
      await telnet.connect({
        host: leader_host,
        port: 2377,
        negotiationMandatory: false,
      });
      return true;
    } catch (err) {
      return false;
    } finally {
      await telnet.destroy();
    }
  }
  async createNetwork(name) {
    const sshClient = new NodeSSH();
    try {
      await sshClient.connect({
        host: this.host,
        username: this.username,
        port: this.port,
        password: this.password,
      });
      const existedNetwork = await sshClient.exec(`docker network ls -q -f name=${name}`);
      if (!existedNetwork) {
        return await sshClient.exec(`docker network create --attachable --driver overlay ${name}`);
      }
      return existedNetwork;
    } finally {
      await sshClient.dispose();
    }
  }
  async startIPsecVPN(name, stdout, stderr) {
    const sshClient = new NodeSSH();
    try {
      await sshClient.connect({
        host: this.host,
        username: this.username,
        port: this.port,
        password: this.password,
      });
      const existedContainer = await sshClient.exec(`docker ps -aq -f "name=${name}"`);
      if (existedContainer) {
        await sshClient.exec(`docker rm -f ${name}`);
      }
      const existedImage = await sshClient.exec('docker images -q hwdsl2/ipsec-vpn-server:latest');
      if (!existedImage) {
        await sshClient.exec('docker pull hwdsl2/ipsec-vpn-server:latest', [], {
          onStdout: chunk => stdout(chunk.toString('utf8')),
          onStderr: chunk => stderr(chunk.toString('utf8')),
        });
      }
      return await sshClient.exec('docker', [
        'run',
        '--name', name,
        '--restart=always',
        '-p', '500:500/udp',
        '-p', '4500:4500/udp',
        '-d', '--privileged',
        'hwdsl2/ipsec-vpn-server',
      ], {
        onStdout: chunk => stdout(chunk.toString('utf8')),
        onStderr: chunk => stderr(chunk.toString('utf8')),
      });
    } finally {
      await sshClient.dispose();
    }
  }
  async fetchVPNLoginInfo(name) {
    const sshClient = new NodeSSH();
    try {
      await sshClient.connect({
        host: this.host,
        username: this.username,
        port: this.port,
        password: this.password,
      });
      return await sshClient.exec(`docker exec ${name} cat /opt/src/vpn-gen.env`);
    } finally {
      await sshClient.dispose();
    }
  }
  async installVPNClient(serverIP, psk, username, password, stdout, stderr) {
    const sshClient = new NodeSSH();
    try {
      await sshClient.connect({
        host: this.host,
        username: this.username,
        port: this.port,
        password: this.password,
      });
      await sshClient.exec('apt-get update', [], {
        onStdout: chunk => stdout(chunk.toString('utf8')),
        onStderr: chunk => stderr(chunk.toString('utf8')),
      });
      await sshClient.exec(
        'DEBIAN_FRONTEND=noninteractive apt-get -y install strongswan xl2tpd',
        [],
        {
          onStdout: chunk => stdout(chunk.toString('utf8')),
          onStderr: chunk => stderr(chunk.toString('utf8')),
        }
      );
      const ipsecConfig = fs.readFileSync(path.join(__dirname, 'config/ipsec.conf'), 'utf8');
      await sshClient.exec(`export VPN_SERVER_IP=${serverIP} && echo "${ipsecConfig.trim()}" > /etc/ipsec.conf`);

      const ipsecSecrets = fs.readFileSync(path.join(__dirname, 'config/ipsec.secrets'), 'utf8');
      await sshClient.exec(`export VPN_IPSEC_PSK=${psk} && echo "${ipsecSecrets.trim()}" > /etc/ipsec.secrets`);
      await sshClient.exec('chmod 600 /etc/ipsec.secrets');

      const xl2tpdConfig = fs.readFileSync(path.join(__dirname, 'config/xl2tpd.conf'), 'utf8');
      await sshClient.exec(`export VPN_SERVER_IP=${serverIP} && echo "${xl2tpdConfig.trim()}" > /etc/xl2tpd/xl2tpd.conf`);

      const l2tpdClient = fs.readFileSync(path.join(__dirname, 'config/options.l2tpd.client'), 'utf8');
      await sshClient.exec(`export VPN_USER=${username} && export VPN_PASSWORD=${password} && echo "${l2tpdClient.trim()}" > /etc/ppp/options.l2tpd.client`);
      await sshClient.exec('chmod 600 /etc/ppp/options.l2tpd.client');
    } finally {
      await sshClient.dispose();
    }
  }
  async startFabricCA(name, version, network, stdout, stderr) {
    const sshClient = new NodeSSH();
    try {
      await sshClient.connect({
        host: this.host,
        username: this.username,
        port: this.port,
        password: this.password,
      });
      const existedCA = await sshClient.exec(`docker ps -aq -f "name=${name}"`);
      if (existedCA) {
        await sshClient.exec(`docker rm -f ${name}`);
      }
      return await sshClient.exec('docker', [
        'run', '-d',
        '--name', name,
        '--network', network,
        '-p', '7054:7054',
        '-e', 'FABRIC_CA_SERVER_HOME=/etc/hyperledger/fabric-ca-server',
        '-e', 'FABRIC_CA_SERVER_CA_NAME=' + name,
        '-e', 'CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=' + network,
        `hyperledger/fabric-ca:${version}`,
        '/bin/bash', '-c',
        'fabric-ca-server start -b admin:adminpw -d'
      ], {
        onStdout: chunk => stdout(chunk.toString('utf8')),
        onStderr: chunk => stderr(chunk.toString('utf8')),
      });
    } finally {
      await sshClient.dispose();
    }
  }
}
module.exports = Server;
