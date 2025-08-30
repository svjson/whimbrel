import licenses from 'spdx-license-list/full.js'

import { makeTask, WhimbrelContext } from '@whimbrel/core-api'
import { beginFlow } from '@whimbrel/flow'
import path from 'node:path'
import {
  resolveAuthor,
  resolveCopyrightHolder,
  resolveCopyrightYear,
  resolveOwner,
  resolveSpdx,
} from '@src/lib'

export const LICENSE__CREATE_FILE = 'license:create-file'

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
    .do(async ({ spdx, year, author, holder, owner }) => {
      const licenseText = licenses[spdx]?.licenseText
      if (licenseText) {
        const templated = licenseText
          .replace(/<year>/g, year)
          .replace(/<name of author>/gi, author)
          .replace(/<copyright holders>/gi, holder)
          .replace(/<owner>/gi, owner)

        await ctx.disk.write(path.join(target.root, 'LICENSE'), templated, 'utf8')
      }
    })
    .run()
}

export const CreateFile = makeTask({
  id: LICENSE__CREATE_FILE,
  name: 'Create LICENSE file',
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
