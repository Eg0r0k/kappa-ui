import type { CssRules, CssVars } from '~/lib/registry'

export const serializeCssRules = (rules: CssRules, indent = ''): string =>
  Object.entries(rules)
    .map(([selector, body]) => {
      if (typeof body === 'string') return `${indent}${selector}: ${body};`
      if (Object.keys(body).length === 0) return `${indent}${selector};`
      return `${indent}${selector} {\n${serializeCssRules(body, `${indent}  `)}\n${indent}}`
    })
    .join('\n')

const block = (selector: string, vars: Record<string, string> | undefined) =>
  vars && Object.keys(vars).length > 0
    ? `${selector} {\n${Object.entries(vars)
        .map(([name, value]) => `  --${name}: ${value};`)
        .join('\n')}\n}`
    : null

export const serializeCssVars = (vars: CssVars) =>
  [block(':root', vars.light), block('.dark', vars.dark), block('@theme inline', vars.theme)]
    .filter((part) => part !== null)
    .join('\n\n')
