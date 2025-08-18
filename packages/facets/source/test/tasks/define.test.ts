import { describe, it, expect } from 'vitest'

import Define from '@src/tasks/define'

describe(Define.id, () => {
  it('should have a proper test once there is a runner', () => {
    expect(Define.id).toEqual('source:define')
  })
})
