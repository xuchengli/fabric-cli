const inquirer = require('inquirer');
const questions = require('../lib/questions');
const Loader = require('../lib/loader');

async function installSwarmLeader(server) {
  const loader = new Loader();
  try {
    loader.process();
    const swarmStatus = await server.checkDockerSwarm();
    const { LocalNodeState, Error } = JSON.parse(swarmStatus);
    if (LocalNodeState !== 'inactive' || Error) {
      await server.leaveDockerSwarm();
    }
    await server.initDockerSwarm();
    return await server.getDockerSwarmToken();
  } finally {
    loader.finish();
  }
}
async function askSwarmLeaderPort(server, leader_host, offset = 0) {
  const swarmLeaderPort = await inquirer.prompt(questions.confirm_swarm_leader_port(leader_host, offset));
  if (swarmLeaderPort.toBeOpened) {
    return await telnetSwarmLeader(server, leader_host, offset);
  } else {
    return await askSwarmLeaderPort(server, leader_host, offset);
  }
}
async function telnetSwarmLeader(server, leader_host, offset = 0) {
  const loader = new Loader();
  try {
    loader.process();
    const swarmLeaderAvailable = await server.telnetDockerSwarmLeader(leader_host);
    if (swarmLeaderAvailable) return;
    else {
      loader.finish();
      return await askSwarmLeaderPort(server, leader_host, offset);
    }
  } finally {
    loader.finish();
  }
}
async function joinSwarm(server, leader_host, token) {
  const loader = new Loader();
  try {
    loader.process();
    const swarmStatus = await server.checkDockerSwarm();
    const { LocalNodeState, Error } = JSON.parse(swarmStatus);
    if (LocalNodeState !== 'inactive' || Error) {
      await server.leaveDockerSwarm();
    }
    return await server.joinDockerSwarm(leader_host, token);
  } finally {
    loader.finish();
  }
}
module.exports = { installSwarmLeader, telnetSwarmLeader, joinSwarm };
