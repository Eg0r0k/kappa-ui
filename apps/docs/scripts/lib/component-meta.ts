import { join } from 'node:path'

import { createParsedCommandLineByJson, getAllExtensions } from '@vue/language-core'
import ts from 'typescript'
import { createCheckerBase } from 'vue-component-meta/lib/checker.js'

import { refineMeta, type RefinedMeta } from './refine-meta.ts'

export const createComponentMeta = (registryRoot: string) => {
  const root = registryRoot.replaceAll('\\', '/')
  const documents = ts.createDocumentRegistry(ts.sys.useCaseSensitiveFileNames, root)
  const shared = new Proxy(ts, {
    get: (target, key) =>
      key === 'createLanguageService'
        ? (host: ts.LanguageServiceHost) => target.createLanguageService(host, documents)
        : Reflect.get(target, key),
  })
  const cache = new Map<string, RefinedMeta>()

  return (file: string): RefinedMeta => {
    const cached = cache.get(file)
    if (cached) return cached
    const path = join(root, 'src', file)
    const json = { extends: join(root, 'tsconfig.json'), skipLibCheck: true, include: [path], exclude: [] }
    const checker = createCheckerBase(
      shared,
      () => {
        const commandLine = createParsedCommandLineByJson(ts, ts.sys, root, json)
        const extensions = getAllExtensions(commandLine.vueOptions).map((extension) => ({
          extension: extension.slice(1),
          isMixedContent: true,
          scriptKind: ts.ScriptKind.Deferred,
        }))
        const { fileNames } = ts.parseJsonConfigFileContent(json, ts.sys, root, {}, undefined, undefined, extensions)
        return [commandLine, fileNames]
      },
      { schema: true },
      root,
    )
    const meta = refineMeta(checker.getComponentMeta(path))
    cache.set(file, meta)
    return meta
  }
}
