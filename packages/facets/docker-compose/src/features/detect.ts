import { DockerComposeYamlAdapter } from '@src/adapters'
import { DetectFunction, WhimbrelContext } from '@whimbrel/core-api'

export const detect: DetectFunction = async (ctx: WhimbrelContext, dir: string) => {
  const dcYaml = await DockerComposeYamlAdapter.readIfExists(ctx.disk, dir)

  if (dcYaml) {
    return {
      detected: true,
      facet: {
        scope: {
          config: {
            path: dcYaml.getPath(),
            services: dcYaml.getServiceNames(),
          },
        },
      },
    }
  }

  return {
    detected: false,
  }
}
