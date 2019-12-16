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
        onStdout: chunk => stdout(chunk.toString('utf8').replace(/^\s+|\s+$/g, '')),
        onStderr: chunk => stderr(chunk.toString('utf8').replace(/^\s+|\s+$/g, '')),
      });
      await sshClient.exec('apt-get autoremove -y --purge docker-engine docker docker.io docker-ce', [], {
        onStdout: chunk => stdout(chunk.toString('utf8').replace(/^\s+|\s+$/g, '')),
        onStderr: chunk => stderr(chunk.toString('utf8').replace(/^\s+|\s+$/g, '')),
      });
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
        onStdout: chunk => stdout(chunk.toString('utf8').replace(/^\s+|\s+$/g, '')),
        onStderr: chunk => stderr(chunk.toString('utf8').replace(/^\s+|\s+$/g, '')),
      });
      await sshClient.exec(
        'DEBIAN_FRONTEND=noninteractive apt-get install -y apt-transport-https ca-certificates curl gnupg-agent software-properties-common',
        [],
        {
          onStdout: chunk => stdout(chunk.toString('utf8').replace(/^\s+|\s+$/g, '')),
          onStderr: chunk => stderr(chunk.toString('utf8').replace(/^\s+|\s+$/g, '')),
        }
      );
      await sshClient.exec('curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -', [], {
        onStdout: chunk => stdout(chunk.toString('utf8').replace(/^\s+|\s+$/g, '')),
        onStderr: chunk => stderr(chunk.toString('utf8').replace(/^\s+|\s+$/g, '')),
      });
      await sshClient.exec(
        'add-apt-repository "deb [arch=' + arch + '] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"',
        [],
        {
          onStdout: chunk => stdout(chunk.toString('utf8').replace(/^\s+|\s+$/g, '')),
          onStderr: chunk => stderr(chunk.toString('utf8').replace(/^\s+|\s+$/g, '')),
        }
      );
      await sshClient.exec('apt-get update', [], {
        onStdout: chunk => stdout(chunk.toString('utf8').replace(/^\s+|\s+$/g, '')),
        onStderr: chunk => stderr(chunk.toString('utf8').replace(/^\s+|\s+$/g, '')),
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
        'DEBIAN_FRONTEND=noninteractive apt-get install -y docker-ce=' + version + ' docker-ce-cli=' + version + ' containerd.io',
        [],
        {
          onStdout: chunk => stdout(chunk.toString('utf8').replace(/^\s+|\s+$/g, '')),
          onStderr: chunk => stderr(chunk.toString('utf8').replace(/^\s+|\s+$/g, '')),
        }
      );
    } finally {
      await sshClient.dispose();
    }
  }
}
module.exports = Server;
