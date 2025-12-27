import { makeFacetModule, moduleTasks } from '@whimbrel/core-api'
import { detect } from './features'
import { Compare, DOTENV__COMPARE } from './tasks'

export { DotEnvFile } from './adapters'

export { Compare, DOTENV__COMPARE } from './tasks'

export default makeFacetModule({
  id: 'dotenv',
  tasks: moduleTasks(Compare),
  detect,
})
