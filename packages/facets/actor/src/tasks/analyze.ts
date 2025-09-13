import { makeTask } from '@whimbrel/core-api'

export const ACTOR__ANALYZE = 'actor:analyze'

export const Analyze = makeTask({
  id: ACTOR__ANALYZE,
  fsMode: '-',
  name: 'Analyze Actor',
})

export default Analyze
