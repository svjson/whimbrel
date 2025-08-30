import { makeTask, WhimbrelContext } from '@whimbrel/core-api'
import { beginFlow } from '@whimbrel/flow'

import {
  resolveAuthor,
  resolveCopyrightHolder,
  resolveCopyrightYear,
  resolveOwner,
  resolveSpdx,
} from '@src/lib'

export const LICENSE__APPLY = 'license:apply'

const execute = async (ctx: WhimbrelContext) => {
  const { target, spdx, year, author, holder, owner } = ctx.step.inputs

  await beginFlow(ctx)
    .let('spdx', spdx ?? (await resolveSpdx(ctx, target)))
    .let('year', year ?? resolveCopyrightYear(ctx, target))
    .let('author', author ?? resolveAuthor(ctx, target))
    .let(
      'holder',
      ({ author }) => holder ?? resolveCopyrightHolder(ctx, target, author),
      'copyright-holder'
    )
    .let('owner', ({ holder }) => owner ?? resolveOwner(ctx, target, holder))
    .run()
}

export const Apply = makeTask({
  id: LICENSE__APPLY,
  name: 'Apply License',
  execute,
  parameters: {
    target: {
      type: 'actor',
      required: true,
      defaults: [{ ref: 'target' }],
    },
    spdx: {
      type: 'string',
    },
    author: {
      type: 'string',
    },
    holder: {
      type: 'string',
    },
    year: {
      type: 'string',
    },
    owner: {
      type: 'string',
    },
  },
})
