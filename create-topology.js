const inquirer = require('inquirer');
const profile = require('./lib/profile');
const questions = require('./lib/questions');
const installPeerOrg = require('./installation/install-peer-org');
const installOrdererCA = require('./installation/install-orderer-ca');

async function createTopology() {
  const consensusAnswer = await inquirer.prompt(questions.select_version_consensus);
  const { fabric_version, consensus_type } = consensusAnswer;

  // 更新profile
  Object.assign(profile, { fabric_version, consensus_type });

  if (consensus_type === 'solo') {
    await installPeerOrg();
    await installOrdererCA();
  }
  return profile;
}
module.exports = { createTopology };
