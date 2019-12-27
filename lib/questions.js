const validateip = require('validate-ip');

module.exports = {
  'select_sys_arch': [
    {
      type: 'list',
      name: 'arch',
      message: '请选择系统架构：',
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
  ],
  'select_docker_version': (choices, version = '') => {
    return [
      {
        type: 'list',
        name: 'docker_version',
        message: '请选择安装的 Docker 版本：',
        default: version,
        choices,
      },
    ];
  },
  'confirm_docker_update': [
    {
      type: 'confirm',
      name: 'toBeUpdated',
      message: '需要更新 Docker 版本，不更新可能会导致创建网络失败，是否更新？',
      default: true,
    },
  ],
  'select_version_consensus': [
    {
      type: 'list',
      name: 'fabric_version',
      message: '请选择 Fabric 版本：',
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
      message: '请选择共识策略：',
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
  'orderer_org_ca': [
    {
      type: 'input',
      name: 'ordererOrgCAHost',
      message: '请输入排序组织 CA 的服务器IP地址：',
      validate: value => {
        if (validateip(value)) return true;
        return '请输入有效的IP地址！'
      },
    },
    {
      type: 'input',
      name: 'ordererOrgCAUserName',
      message: '请输入排序组织 CA 的服务器登录名：',
      default: 'root',
      validate: value => {
        if (value) return true;
        return '请输入登录名！';
      },
    },
    {
      type: 'password',
      name: 'ordererOrgCAPassword',
      message: '请输入排序组织 CA 的服务器登录密码：',
      mask: '*',
      validate: value => {
        if (value) return true;
        return '请输入登录密码！';
      },
    },
  ],
};
