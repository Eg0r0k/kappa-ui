import { createHighlighter, type Highlighter } from 'shiki'

export type HighlightLang = 'vue' | 'ts' | 'bash' | 'css' | 'json'

let highlighter: Promise<Highlighter> | undefined

export const highlight = async (code: string, lang: HighlightLang) => {
  highlighter ??= createHighlighter({
    themes: ['github-light', 'github-dark'],
    langs: ['vue', 'ts', 'bash', 'css', 'json'],
  })
  return (await highlighter).codeToHtml(code, {
    lang,
    themes: { default: 'github-light', dark: 'github-dark' },
    defaultColor: false,
  })
}

export const langOf = (path: string): HighlightLang => (path.endsWith('.vue') ? 'vue' : 'ts')
