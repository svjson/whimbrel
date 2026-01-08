export const fromNpm = {
  rootModule: {
    'pnpm-workspace-yaml': ['packages:', '  - packages/*', ''].join('\n'),
    'package.json': {
      scripts: {
        build: 'pnpm -r build',
        'dev:backend': 'pnpm --filter @pennant/backend dev',
        'dev:frontend': 'pnpm --filter @pennant/frontend dev',
        'start:backend': 'pnpm --filter @pennant/backend start',
        'start:frontend': 'pnpm --filter @pennant/frontend start',
      },
    },
  },
  packages: {
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
  },
}

export default {
  fromNpm,
}
