import { mkdir, mkdtemp, rename, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { stampOf } from '../../scripts/lib/stamp.ts'

let root = ''

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'kappa-stamp-'))
  await mkdir(join(root, 'src/nested'), { recursive: true })
  await writeFile(join(root, 'src/a.ts'), 'a')
  await writeFile(join(root, 'src/nested/b.ts'), 'b')
  await writeFile(join(root, 'manifest.json'), '{}')
})

afterEach(() => rm(root, { recursive: true, force: true }))

const inputs = () => [join(root, 'src'), join(root, 'manifest.json')]

describe('stampOf', () => {
  it('is stable for unchanged inputs, whatever the order they are listed in', async () => {
    const stamp = await stampOf(root, inputs())

    expect(await stampOf(root, inputs().reverse())).toBe(stamp)
  })

  it('changes when a file under an input directory changes or moves', async () => {
    const stamp = await stampOf(root, inputs())

    await writeFile(join(root, 'src/nested/b.ts'), 'B')
    const edited = await stampOf(root, inputs())
    await rename(join(root, 'src/nested/b.ts'), join(root, 'src/b.ts'))
    const moved = await stampOf(root, inputs())

    expect(edited).not.toBe(stamp)
    expect(moved).not.toBe(edited)
  })
})
