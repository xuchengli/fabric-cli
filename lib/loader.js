const inquirer = require('inquirer');
const ui = new inquirer.ui.BottomBar();

const prefix = ['/ 正在安装中.... ', '| 正在安装中.... ', '\\ 正在安装中.... ', '- 正在安装中.... '];

let i = 0, interval = null;
const buffer = [];

function writeBuffer(logs) {
  buffer.push(...[...logs.split('\n')].filter(log => log));
}
function process() {
  ui.updateBottomBar(prefix[i % 4]);
  if (!interval) {
    interval = setInterval(() => {
      ui.updateBottomBar(`${prefix[i++ % 4]}${buffer.length > 1 ? buffer.shift() : buffer[0]}`);
    }, 100);
  }
}
function finish() {
  i = 0;
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
  buffer.length = 0;
  ui.updateBottomBar('');
}
exports.writeBuffer = writeBuffer;
exports.process = process;
exports.finish = finish;
