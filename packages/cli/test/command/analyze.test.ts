import { describe, it, expect } from 'vitest'
import { addAnalyzeCommand } from '@src/command/analyze'
import { Command } from 'commander'

describe('Analyze Command', () => {
  describe('addAnalyzeCommand', () => {
    it('should add the Analyze command to the provided program/Commmand', () => {
      // Given
      const program = new Command()

      // When
      addAnalyzeCommand(program)

      // Then
      expect(program.commands).toHaveLength(1)
    })
  })
})
