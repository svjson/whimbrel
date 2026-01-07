export const fromNpm = {
  'packages/core': {
    'package.json': {
      dependencies: undefined,
    },
  },
  'packages/frontend': {
    'package.json': {
      dependencies: {
        '@pennant/core': 'workspace:*',
      },
    },
  },
  'packages/backend': {
    'package.json': {
      dependencies: {
        '@pennant/core': 'workspace:*',
        cors: '^2.8.5',
        express: '^4.19.2',
      },
    },
  },
}

export default {
  fromNpm,
}
