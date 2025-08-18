import { describe, it, expect } from 'vitest'

import DiscoverFacets from '@src/tasks/discover-facets'

describe(DiscoverFacets.id, () => {
  it('should have a proper test once there is a runner', () => {
    expect(DiscoverFacets.id).toEqual('actor:discover-facets')
  })
})
