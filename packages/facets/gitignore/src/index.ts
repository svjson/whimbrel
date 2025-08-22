import { makeFacetModule, moduleTasks } from '@whimbrel/core-api'
import { Create } from './tasks'
import detect from './detect'

export { GITIGNORE__CREATE, Create } from './tasks'

export default makeFacetModule({
  id: 'gitignore',
  implicits: ['node'],
  tasks: moduleTasks(Create),
  detect,
})
