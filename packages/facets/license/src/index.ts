import { makeFacetModule, moduleTasks } from '@whimbrel/core-api'

import { detect, applyLicenseAugmentation } from './features'
import { LICENSE__APPLY, Apply, CreateFile } from './tasks'

export {
  resolveAuthor,
  resolveCopyrightHolder,
  resolveCopyrightYear,
  resolveOwner,
  resolveSpdx,
} from './lib'

export default makeFacetModule({
  id: 'license',
  tasks: moduleTasks(Apply, CreateFile),
  taskAugmentations: {
    [LICENSE__APPLY]: {
      steps: applyLicenseAugmentation,
    },
  },
  detect,
})
