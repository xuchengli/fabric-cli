const inquirer = require('inquirer');
const questions = require('./questions');

async function createTopology() {
  const consensusAnswer = await inquirer.prompt(questions.select_consensus_type);
  return consensusAnswer.consensus_type;
}
module.exports = { createTopology };
