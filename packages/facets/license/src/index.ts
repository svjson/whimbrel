import { makeFacetModule, moduleTasks } from '@whimbrel/core-api'

import { detect } from './features'
import { Apply, CreateFile } from './tasks'

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
  detect,
})
