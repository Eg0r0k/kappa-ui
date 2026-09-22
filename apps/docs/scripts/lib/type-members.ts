import { join } from 'node:path'

import ts from 'typescript'

export const typeMembers = (registryRoot: string, file: string, typeName: string) => {
  const config = ts.getParsedCommandLineOfConfigFile(join(registryRoot, 'tsconfig.json'), {}, {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: () => {},
  })
  const path = join(registryRoot, 'src', file)
  const program = ts.createProgram({ rootNames: [path], options: config?.options ?? {} })
  const checker = program.getTypeChecker()
  const source = program.getSourceFile(path)
  const module = source ? checker.getSymbolAtLocation(source) : undefined
  const symbol = module ? checker.getExportsOfModule(module).find((entry) => entry.name === typeName) : undefined
  if (!symbol) throw new Error(`${file} does not export a type named "${typeName}"`)

  const type = checker.getDeclaredTypeOfSymbol(symbol)
  return checker.getPropertiesOfType(type).map((property) => ({
    name: property.name,
    type: checker.typeToString(
      checker.getTypeOfSymbol(property),
      undefined,
      ts.TypeFormatFlags.NoTruncation,
    ),
  }))
}
