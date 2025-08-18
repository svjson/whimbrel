import { makeFacetModule, moduleTasks } from '@whimbrel/core-api'
import { Create } from './tasks'

export { GITIGNORE__CREATE, Create } from './tasks'

export default makeFacetModule({
  id: 'gitignore',
  tasks: moduleTasks(Create),
})
