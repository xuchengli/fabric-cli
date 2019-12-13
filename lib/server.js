const log = require('log-beautify');
const NodeSSH = require('node-ssh');

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
    } finally {
      await sshClient.dispose();
    }
  }
  async removeDocker() {
    const sshClient = new NodeSSH();
    try {
      await sshClient.connect({
        host: this.host,
        username: this.username,
        port: this.port,
        password: this.password,
      });
      await sshClient.exec('apt-get purge -y docker-engine docker docker.io docker-ce');
      await sshClient.exec('apt-get autoremove -y --purge docker-engine docker docker.io docker-ce');
    } finally {
      await sshClient.dispose();
    }
  }
}
module.exports = Server;
