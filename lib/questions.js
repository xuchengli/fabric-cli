const validateip = require('validate-ip');

module.exports = {
  'server_arch': offset => {
    return [
      {
        type: 'list',
        name: 'arch',
        message: ''.padStart(offset) + '|----请选择服务器系统架构：',
        default: 'amd64',
        choices: [
          {
            name: 'x86_64 / amd64',
            value: 'amd64',
          },
          {
            name: 'armhf',
            value: 'armhf',
          },
          {
            name: 'arm64',
            value: 'arm64',
          },
          {
            name: 'ppc64le (IBM Power)',
            value: 'ppc64el',
          },
          {
            name: 's390x (IBM Z)',
            value: 's390x',
          },
        ],
      },
    ];
  },
  'docker_version': (choices, version = '', offset) => {
    return [
      {
        type: 'list',
        name: 'docker_version',
        message: ''.padStart(offset) + '|----请选择安装的 Docker 版本：',
        default: version,
        choices,
      },
    ];
  },
  'confirm_docker_update': offset => {
    return [
      {
        type: 'confirm',
        name: 'toBeUpdated',
        message: ''.padStart(offset) + '|----需要更新 Docker 版本，不更新可能会导致创建网络失败，是否更新？',
        default: true,
      },
    ];
  },
  'vpn': [
    {
      type: 'input',
      name: 'host',
      message: '|----请输入服务器IP地址：',
      validate: value => {
        if (validateip(value)) return true;
        return '请输入有效的IP地址！';
      },
    },
    {
      type: 'input',
      name: 'username',
      message: '|----请输入服务器登录名：',
      default: 'root',
      validate: value => {
        if (value) return true;
        return '请输入登录名！';
      },
    },
    {
      type: 'password',
      name: 'password',
      message: '|----请输入服务器登录密码：',
      mask: '*',
      validate: value => {
        if (value) return true;
        return '请输入登录密码！';
      },
    },
  ],
  'fabric_version_consensus': [
    {
      type: 'list',
      name: 'version',
      message: '|----请选择 Fabric 版本：',
      default: '1.4.4',
      choices: [
        {
          name: '2.0.0',
          disabled: '当前不可用',
        },
        '1.4.4',
      ],
    },
    {
      type: 'list',
      name: 'consensus_type',
      message: '|----请选择共识策略：',
      default: 'solo',
      choices: [
        {
          name: 'Solo',
          value: 'solo',
        },
        {
          name: 'Raft',
          value: 'raft',
          disabled: '当前不可用',
        },
        {
          name: 'Kafka',
          value: 'kafka',
          disabled: '当前不可用',
        },
      ],
    },
  ],
  'peer_org_number': [
    {
      type: 'input',
      name: 'peer_org_number',
      message: '|----请输入节点组织的数量：',
      default: 1,
      validate: value => {
        if (!isNaN(value) && parseInt(value) > 0 && Number.isInteger(parseFloat(value))) return true;
        return '请输入有效的数量！';
      },
    },
  ],
  'peer_org_ca': (number, offset) => {
    return [
      {
        type: 'input',
        name: 'host',
        message: ''.padStart(offset) + `|----请输入第 ${number} 个节点组织 CA 的服务器IP地址：`,
        validate: value => {
          if (validateip(value)) return true;
          return '请输入有效的IP地址！'
        },
      },
      {
        type: 'input',
        name: 'username',
        message: ''.padStart(offset) + `|----请输入第 ${number} 个节点组织 CA 的服务器登录名：`,
        default: 'root',
        validate: value => {
          if (value) return true;
          return '请输入登录名！';
        },
      },
      {
        type: 'password',
        name: 'password',
        message: ''.padStart(offset) + `|----请输入第 ${number} 个节点组织 CA 的服务器登录密码：`,
        mask: '*',
        validate: value => {
          if (value) return true;
          return '请输入登录密码！';
        },
      },
    ];
  },
  'peer_org_peer_number': (number, offset) => {
    return [
      {
        type: 'input',
        name: 'peer_org_peer_number',
        message: ''.padStart(offset) + `|----请输入第 ${number} 个节点组织的节点数量：`,
        default: 2,
        validate: value => {
          if (!isNaN(value) && parseInt(value) > 0 && Number.isInteger(parseFloat(value))) return true;
          return '请输入有效的数量！';
        },
      },
    ];
  },
  'peer_org_peer': (number, offset) => {
    return [
      {
        type: 'input',
        name: 'host',
        message: ''.padStart(offset) + `|----请输入当前组织第 ${number} 个节点的服务器IP地址：`,
        validate: value => {
          if (validateip(value)) return true;
          return '请输入有效的IP地址！'
        },
      },
      {
        type: 'input',
        name: 'username',
        message: ''.padStart(offset) + `|----请输入当前组织第 ${number} 个节点的服务器登录名：`,
        default: 'root',
        validate: value => {
          if (value) return true;
          return '请输入登录名！';
        },
      },
      {
        type: 'password',
        name: 'password',
        message: ''.padStart(offset) + `|----请输入当前组织第 ${number} 个节点的服务器登录密码：`,
        mask: '*',
        validate: value => {
          if (value) return true;
          return '请输入登录密码！';
        },
      },
    ];
  },
  'orderer_org_ca': [
    {
      type: 'input',
      name: 'orderer_org_ca_host',
      message: '请输入排序组织 CA 的服务器IP地址：',
      validate: value => {
        if (validateip(value)) return true;
        return '请输入有效的IP地址！'
      },
    },
    {
      type: 'input',
      name: 'orderer_org_ca_username',
      message: '请输入排序组织 CA 的服务器登录名：',
      default: 'root',
      validate: value => {
        if (value) return true;
        return '请输入登录名！';
      },
    },
    {
      type: 'password',
      name: 'orderer_org_ca_password',
      message: '请输入排序组织 CA 的服务器登录密码：',
      mask: '*',
      validate: value => {
        if (value) return true;
        return '请输入登录密码！';
      },
    },
  ],
  'confirm_vpn_server_port': (vpnServer, offset = 0) => {
    return [
      {
        type: 'confirm',
        name: 'toBeOpened',
        message: ''.padStart(offset) + '>> VPN服务器连接失败，请确认服务器：' + vpnServer + ' 的 500 和 4500 的UDP端口已打开，然后继续，是否已打开？',
        default: true,
      },
    ];
  },
};
