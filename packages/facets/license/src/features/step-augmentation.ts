import { LICENSE__CREATE_FILE } from '@src/tasks'
import { StepAugmentationGenerator } from '@whimbrel/core-api'

export const applyLicenseAugmentation: StepAugmentationGenerator = async ({ step }) => {
  const actorId = step.bind[step.bind.key]
  if (!actorId) return []

  const { spdx, year, author, holder, owner } = step.inputs

  return [
    {
      type: LICENSE__CREATE_FILE,
      bind: {
        target: actorId,
        key: 'target',
      },
      inputs: {
        spdx,
        year,
        author,
        holder,
        owner,
      },
    },
  ]
}
