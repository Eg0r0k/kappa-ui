import type { EffectStyleToken, SyncReport, TextStyleToken, TokenPayload, TokenVariable } from '../payload.ts'
import type { Context } from './boards.ts'
import { drawBoards } from './boards.ts'
import { byId, emptyReport, ensurePages, managedTextStyles, required, settle, upsert } from './shared.ts'

const FONT_STYLES: Record<number, string> = { 400: 'Regular', 500: 'Medium', 600: 'Semi Bold', 700: 'Bold' }

const fontOf = (weight: number): FontName => {
  const style = FONT_STYLES[weight]
  if (!style) throw new Error(`No Inter style for weight ${weight}`)
  return { family: 'Inter', style }
}

const syncCollections = async (payload: TokenPayload, report: SyncReport) => {
  const managed = byId(await figma.variables.getLocalVariableCollectionsAsync())
  const mode = payload.theme === 'dark' ? 'Dark' : 'Light'
  const collections = new Map<string, VariableCollection>()
  for (const name of new Set(payload.variables.map((token) => token.collection))) {
    const collection = upsert(
      managed,
      `Collection/${name}`,
      () => figma.variables.createVariableCollection(name),
      report,
    )
    collection.name = name
    collection.renameMode(collection.modes[0].modeId, mode)
    collections.set(name, collection)
  }
  return { managed, collections }
}

const valueOf = (token: TokenVariable, variables: Map<string, Variable>): VariableValue => {
  if (typeof token.value === 'object' && 'alias' in token.value) {
    return figma.variables.createVariableAlias(required(variables, token.value.alias))
  }
  return token.value
}

const syncVariables = async (
  payload: TokenPayload,
  collections: Map<string, VariableCollection>,
  report: SyncReport,
) => {
  const managed = byId(await figma.variables.getLocalVariablesAsync())
  const variables = new Map<string, Variable>()
  for (const token of payload.variables) {
    const collection = required(collections, token.collection)
    const variable = upsert(
      managed,
      token.id,
      () => figma.variables.createVariable(token.name, collection, token.type),
      report,
    )
    if (variable.variableCollectionId !== collection.id) {
      throw new Error(`${token.id} lives in another collection; delete it in Figma and sync again`)
    }
    variable.name = token.name
    variable.scopes = token.scopes
    variable.setVariableCodeSyntax('WEB', token.code)
    variables.set(token.id, variable)
  }
  for (const token of payload.variables) {
    const modeId = required(collections, token.collection).modes[0].modeId
    required(variables, token.id).setValueForMode(modeId, valueOf(token, variables))
  }
  return { managed, variables }
}

const syncTextStyles = async (tokens: TextStyleToken[], report: SyncReport) => {
  const managed = await managedTextStyles()
  const styles = new Map<string, TextStyle>()
  for (const token of tokens) {
    const style = upsert(managed, token.id, () => figma.createTextStyle(), report)
    const fontName = fontOf(token.fontWeight)
    await figma.loadFontAsync(fontName)
    style.name = token.name
    style.fontName = fontName
    style.fontSize = token.fontSize
    style.lineHeight = { unit: 'PIXELS', value: token.lineHeight }
    styles.set(token.id, style)
  }
  return { managed, styles }
}

const syncEffectStyles = async (tokens: EffectStyleToken[], report: SyncReport) => {
  const managed = byId(await figma.getLocalEffectStylesAsync())
  const styles = new Map<string, EffectStyle>()
  for (const token of tokens) {
    const style = upsert(managed, token.id, () => figma.createEffectStyle(), report)
    style.name = token.name
    style.effects = token.layers.map((layer): DropShadowEffect | InnerShadowEffect => {
      const shadow = {
        color: layer.color,
        offset: { x: layer.x, y: layer.y },
        radius: layer.blur,
        spread: layer.spread,
        visible: true,
        blendMode: 'NORMAL' as const,
      }
      if (layer.inset) return { ...shadow, type: 'INNER_SHADOW' }
      return { ...shadow, type: 'DROP_SHADOW', showShadowBehindNode: false }
    })
    styles.set(token.id, style)
  }
  return { managed, styles }
}

export const syncTokens = async (payload: TokenPayload) => {
  await figma.saveVersionHistoryAsync(`kappa-ui tokens sync (${payload.theme})`)
  const report = emptyReport()
  const foundations = await ensurePages(report)
  const collections = await syncCollections(payload, report)
  const variables = await syncVariables(payload, collections.collections, report)
  const textStyles = await syncTextStyles(payload.textStyles, report)
  const effectStyles = await syncEffectStyles(payload.effectStyles, report)
  settle(variables.managed, new Set(variables.variables.keys()), payload.prune, report)
  const keptCollections = new Set([...collections.collections.keys()].map((name) => `Collection/${name}`))
  settle(collections.managed, keptCollections, payload.prune, report)
  settle(textStyles.managed, new Set(textStyles.styles.keys()), payload.prune, report)
  settle(effectStyles.managed, new Set(effectStyles.styles.keys()), payload.prune, report)
  const context: Context = {
    variables: variables.variables,
    textStyles: textStyles.styles,
    effectStyles: effectStyles.styles,
  }
  await drawBoards(foundations, payload, context, report)
  return report
}
