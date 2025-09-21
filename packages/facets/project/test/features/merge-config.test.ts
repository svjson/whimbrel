import { describe, expect, it } from 'vitest'

import { ProjectConfig, ProjectFacet } from '@src/index'

describe('mergeConfig', () => {
  const HUMLAN = {
    actorId: 'humlan',
    name: 'Humlan',
    root: '/tmp/packages/humlan',
    relativeRoot: 'packages/humlan',
  }
  const KORVEN = {
    actorId: 'korven',
    name: 'Koreven',
    root: '/tmp/packages/korven',
    relativeRoot: 'packages/korven',
  }
  const OSTEN = {
    actorId: 'osten',
    name: 'Osten',
    root: '/tmp/packages/osten',
    relativeRoot: 'packages/osten',
  }
  const KLOSSEN = {
    actorId: 'klossen',
    name: 'Klossen',
    root: '/tmp/packages/klossen',
    relativeRoot: 'packages/klossen',
  }

  const configA: ProjectConfig = {
    type: 'default',
    subModules: [HUMLAN, KORVEN, OSTEN],
  }

  const configB: ProjectConfig = {
    type: 'default',
    subModules: [KLOSSEN, OSTEN],
  }

  it('should merge config with empty config', () => {
    expect(ProjectFacet.mergeConfig(configA, {})).toEqual(configA)
  })

  it('should merge two configs and combine subModules', () => {
    expect(ProjectFacet.mergeConfig(configA, configB)).toEqual({
      type: 'default',
      subModules: [HUMLAN, KORVEN, OSTEN, KLOSSEN],
    })
  })
})
