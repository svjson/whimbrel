import { makeFacetModule, moduleTasks } from '@whimbrel/core-api'
import detect from './detect'

export default makeFacetModule({
  id: 'package.json',
  detect,
})
