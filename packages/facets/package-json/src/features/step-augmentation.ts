import { PACKAGE_JSON__SET_PROPERTY } from '@src/tasks'
import { StepAugmentationGenerator } from '@whimbrel/core-api'

export const applyLicenseAugmentation: StepAugmentationGenerator = async ({ step }) => {
  const actorId = step.bind[step.bind.key]
  if (!actorId) return []

  return [
    {
      type: PACKAGE_JSON__SET_PROPERTY,
      bind: {
        target: actorId,
        key: 'target',
      },
      inputs: {
        property: 'license',
        value: step.inputs.spdx,
      },
    },
  ]
}
