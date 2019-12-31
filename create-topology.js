const inquirer = require('inquirer');
const questions = require('./lib/questions');
const { installOrdererCA } = require('./installation/install-orderer-ca');

async function createTopology() {
  const consensusAnswer = await inquirer.prompt(questions.select_version_consensus);
  if (consensusAnswer.consensus_type === 'solo') {
    return await installOrdererCA();
  }
  return true;
}
module.exports = { createTopology };
