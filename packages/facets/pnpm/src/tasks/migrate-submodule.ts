import { makeTask } from '@whimbrel/core-api'

/**
 * Global identifier for the MigrateSubmoduleTask
 */
export const PNPM__MIGRATE_SUBMODULE = 'pnpm:migrate-submodule'

/**
 * Umbrella task for all submodule migrations
 */
export const MigrateSubmodule = makeTask({
  id: PNPM__MIGRATE_SUBMODULE,
  name: 'Migrate Submodule',
  fsMode: '-',
  parameters: {
    target: {
      type: 'actor',
      required: true,
      defaults: [{ ref: 'target' }],
    },
  },
})
