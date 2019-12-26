const log = require('log-beautify');
const NodeSSH = require('node-ssh');
const Telnet = require('telnet-client');

log.useLabels = true;

class Server {
  constructor(host, username, password, port = 22) {
    this.host = host;
    this.username = username;
    this.password = password;
    this.port = port;
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
  async joinDockerSwarm(leader, token) {
    const sshClient = new NodeSSH();
    try {
      await sshClient.connect({
        host: this.host,
        username: this.username,
        port: this.port,
        password: this.password,
      });
      return await sshClient.exec(`docker swarm join --token ${token} ${leader.host}:2377`);
    } finally {
      await sshClient.dispose();
    }
  }
  async telnetDockerSwarmLeader(leader) {
    const telnet = new Telnet();
    try {
      await telnet.connect({
        host: leader.host,
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
}
module.exports = Server;
