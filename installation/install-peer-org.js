const inquirer = require('inquirer');
const questions = require('../lib/questions');

async function installPeerOrg() {
  const peerOrgNumber = await inquirer.prompt(questions.peer_org_number);
  for (let i=1; i <= parseInt(peerOrgNumber.peer_org_number); i++) {
    const peerOrgCA = await inquirer.prompt(questions.peer_org_ca(i));

    // TODO: 安装每个节点组织CA
    console.log(peerOrgCA);

    const peerOrgPeerNumber = await inquirer.prompt(questions.peer_org_peer_number(i));
    for (let j=1; j <= parseInt(peerOrgPeerNumber.peer_org_peer_number); j++) {
      const peerOrgPeer = await inquirer.prompt(questions.peer_org_peer(j));

      // TODO: 安装节点组织下面的每个节点
      console.log(peerOrgPeer);
    }
  }
  return true;
}
module.exports = installPeerOrg;
