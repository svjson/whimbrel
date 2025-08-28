import { describe, it, expect } from 'vitest'
import { getTaskDependencies, TaskTree, readTaskTree } from '@src/index'
import { TurboJSON } from '@src/adapters/turbo.json-adapter'

describe('readTaskTree', () => {
  it('should read tasks from turbo.json', () => {
    // Given
    const turboJSON = new TurboJSON({
      content: {
        $schema: 'https://turborepo.com/schema.json',
        ui: 'tui',
        tasks: {
          build: {
            dependsOn: ['^build'],
            outputs: ['./dist/**', './build/**'],
          },
          test: {
            dependsOn: ['^build'],
          },
          lint: {
            dependsOn: ['^lint'],
          },
          dev: {
            dependsOn: ['^build'],
            cache: false,
            persistent: true,
          },
        },
      },
    })

    // When
    const taskTree = readTaskTree(turboJSON)

    // Then
    expect(taskTree).toEqual({
      build: {
        name: 'build',
        dependsOn: ['^build'],
        config: { dependsOn: ['^build'], outputs: ['./dist/**', './build/**'] },
      },
      test: {
        name: 'test',
        dependsOn: ['^build'],
        config: { dependsOn: ['^build'] },
      },
      lint: {
        name: 'lint',
        dependsOn: ['^lint'],
        config: { dependsOn: ['^lint'] },
      },
      dev: {
        name: 'dev',
        dependsOn: ['^build'],
        config: { dependsOn: ['^build'], cache: false, persistent: true },
      },
    })
  })
})

describe('getTaskDependencies', () => {
  it('should... what?', () => {
    // Given
    const taskTree: TaskTree = {
      build: {
        name: 'build',
        dependsOn: ['^build'],
        config: { dependsOn: ['^build'], outputs: ['./dist/**', './build/**'] },
      },
      test: {
        name: 'test',
        dependsOn: ['^build'],
        config: { dependsOn: ['^build'] },
      },
      lint: {
        name: 'lint',
        dependsOn: ['^lint'],
        config: { dependsOn: ['^lint'] },
      },
      dev: {
        name: 'dev',
        dependsOn: ['^build'],
        config: { dependsOn: ['^build'], cache: false, persistent: true },
      },
    }

    // When
    const dependencies = getTaskDependencies(taskTree, 'dev')

    // Then
    expect(dependencies).toEqual(['^build'])
  })
})
