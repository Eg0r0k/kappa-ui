import { stripTypeScriptTypes } from 'node:module'

const RELATIVE_IMPORT = /^import \{[^}]*\} from '(?:\.\.?\/)+[\w./-]+\.ts'$/gm

const lineOf = (file: string, line: string) => {
  if (line.startsWith('import ')) throw new Error(`${file}: unsupported import: ${line}`)
  if (line.startsWith('export const ')) return line.slice('export '.length)
  if (line.startsWith('export ')) throw new Error(`${file}: unsupported export: ${line}`)
  return line
}

export const bundleOf = (files: { file: string; source: string }[], call: string, payload: unknown) => {
  const body = files.map(({ file, source }) =>
    stripTypeScriptTypes(source)
      .replace(RELATIVE_IMPORT, '')
      .split('\n')
      .map((line) => lineOf(file, line))
      .join('\n'),
  )
  return `${body.join('\n')}\nreturn ${call}(${JSON.stringify(payload)})\n`
}
