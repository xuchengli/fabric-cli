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
module.exports = { installSwarmLeader, joinSwarm };
