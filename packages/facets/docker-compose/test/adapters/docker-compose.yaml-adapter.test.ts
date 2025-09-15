import { describe, expect, it } from 'vitest'
import { DockerComposeYamlAdapter } from '@src/index'

describe('DockerComposeYamlAdapter', () => {
  describe('getServiceNames', () => {
    it('should return the names of all service entries', () => {
      // Given
      const dcYaml = new DockerComposeYamlAdapter({
        content: [
          'services:',
          '  sql:',
          '    image: mcr.microsoft.com/azure-sql-edge',
          '  kibana:',
          '    image: docker.elastic.co/kibana/kibana:8.4.1',
        ].join('\n'),
      })

      // Then
      expect(dcYaml.getServiceNames()).toEqual(['sql', 'kibana'])
    })
  })
})
