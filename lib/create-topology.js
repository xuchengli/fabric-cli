const inquirer = require('inquirer');
const questions = require('./questions');

async function createTopology() {
  const consensusAnswer = await inquirer.prompt(questions.select_version_consensus);
  if (consensusAnswer.consensus_type === 'solo') {
    const ordererOrgCA = await inquirer.prompt(questions.orderer_org_ca);
    return Object.assign(ordererOrgCA, consensusAnswer);
  }
  return null;
}
module.exports = { createTopology };
