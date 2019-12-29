const inquirer = require('inquirer');

class Loader {
  constructor() {
    this.prefix = ['/', '|', '\\', '-'];
    this.counter = 0;
    this.interval = null;
    this.buffer = [];
    this.ui = new inquirer.ui.BottomBar();
  }
  writeBuffer(logs) {
    this.buffer.push(...[...logs.split('\n')].filter(log => log));
  }
  process(info = '正在安装中....') {
    this.ui.updateBottomBar(`${this.prefix[this.counter % 4]} ${info}`);
    if (!this.interval) {
      this.interval = setInterval(() => {
        this.ui.updateBottomBar(
          `${this.prefix[this.counter++ % 4]} ${info} ${this.buffer.length > 1 ? this.buffer.shift() : this.buffer[0] || ''}`
        );
      }, 100);
    }
  }
  finish() {
    this.counter = 0;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.buffer.length = 0;
    this.ui.updateBottomBar('');
    this.ui.close();
    this.ui = null;
  }
}
module.exports = Loader;
