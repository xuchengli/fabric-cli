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
  'select_docker_version': (choices, version) => {
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
};