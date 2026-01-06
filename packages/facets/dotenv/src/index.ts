import { makeFacetModule, moduleTasks } from '@whimbrel/core-api'
import { detect } from './features'
import {
  Compare,
  UpdateTemplates,
  DOTENV__COMPARE,
  DOTENV__UPDATE_TEMPLATES,
} from './tasks'

export { DotEnvFile } from './adapters'

export { Compare, UpdateTemplates, DOTENV__COMPARE, DOTENV__UPDATE_TEMPLATES }

/**
 * @whimbrel:facet dotenv
 */
export default makeFacetModule({
  id: 'dotenv',
  tasks: moduleTasks(Compare, UpdateTemplates),
  detect,
})
