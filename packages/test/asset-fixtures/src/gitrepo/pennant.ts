import path from 'node:path'

const submodules = {
  backend: {
    path: ['packages', 'backend'],
  },
  frontend: {
    path: ['packages', 'frontend'],
  },
  core: {
    path: ['packages', 'core'],
  },
}

export default {
  submodules,
  submodulePaths: Object.values(submodules).map((sm) => path.join(...sm.path)),
}
