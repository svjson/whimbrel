import path from 'node:path'

import { leftPad } from '@whimbrel/array'
import { WhimbrelContext } from '@whimbrel/core-api'

export const outputContextFile = async (ctx: WhimbrelContext, catFile: string) => {
  ctx.log.info()

  const [owner, file, actorRef] = resolveFileReference(ctx, catFile)

  if (actorRef && !owner) {
    ctx.log.error(`Unknown root: ${actorRef}`)
    return
  }

  if (!(await ctx.disk.exists(file))) {
    ctx.log.error(`File not found: ${file}`)
  }

  const content = await ctx.disk.read(file, 'utf8')

  ctx.log.banner(catFile, `${file}`)
  ctx.log.info(content)
}

const resolveFileReference = (ctx: WhimbrelContext, catFile: string) => {
  const fileLocatorParts = catFile.split(':')

  const [actorId, fileRef] = leftPad(fileLocatorParts, 2)
  const actor = actorId ? ctx.getActor(actorId) : undefined

  const file = actor ? path.join(actor.root, fileRef) : fileRef

  return [actor, file, actorId]
}
