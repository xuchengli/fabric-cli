const inquirer = require('inquirer');
const profile = require('./lib/profile');
const questions = require('./lib/questions');
const { installOrdererCA } = require('./installation/install-orderer-ca');

async function createTopology() {
  const consensusAnswer = await inquirer.prompt(questions.select_version_consensus);
  const { fabric_version, consensus_type } = consensusAnswer;

  profile.fabric_version = fabric_version;
  profile.consensus = consensus_type;

  if (consensus_type === 'solo') {
    await installOrdererCA();
  }
  return profile;
}
module.exports = { createTopology };
