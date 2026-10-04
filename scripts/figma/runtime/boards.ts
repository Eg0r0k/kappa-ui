import type { SyncReport, TokenPayload, TokenVariable } from '../payload.ts'
import { bindRadius, boardSection, loadFonts, paintOf, required, sequence, stack, textOf } from './shared.ts'

export type Context = {
  variables: Map<string, Variable>
  textStyles: Map<string, TextStyle>
  effectStyles: Map<string, EffectStyle>
}

const SWATCH = 160
const COLUMNS = 7
const GAP = 24
const BOARD_GAP = 160

const variableOf = (context: Context, id: string) => required(context.variables, id)

const title = (context: Context, characters: string) =>
  textOf(characters, required(context.textStyles, 'Text/label/md'), variableOf(context, 'Color/foreground'))

const caption = (context: Context, characters: string) =>
  textOf(characters, required(context.textStyles, 'Text/body/sm'), variableOf(context, 'Color/muted-foreground'))

const aliasOf = (value: TokenVariable['value']) =>
  typeof value === 'object' && 'alias' in value ? value.alias : undefined

const tile = async (context: Context, name: string, preview: SceneNode, lines: string[]) => {
  const frame = stack(name, 'VERTICAL', 6)
  frame.appendChild(preview)
  frame.counterAxisSizingMode = 'FIXED'
  frame.resize(SWATCH, frame.height)
  const texts = [await title(context, lines[0]), ...(await sequence(lines.slice(1), (line) => caption(context, line)))]
  for (const text of texts) {
    frame.appendChild(text)
    text.layoutSizingHorizontal = 'FILL'
    text.textAutoResize = 'HEIGHT'
  }
  return frame
}

const grid = (name: string, children: SceneNode[]) => {
  const frame = stack(name, 'HORIZONTAL', GAP)
  frame.layoutWrap = 'WRAP'
  frame.counterAxisSpacing = GAP
  for (const child of children) frame.appendChild(child)
  frame.primaryAxisSizingMode = 'FIXED'
  frame.resize(COLUMNS * SWATCH + (COLUMNS - 1) * GAP, frame.height)
  frame.counterAxisSizingMode = 'AUTO'
  return frame
}

const colorTile = (context: Context, token: TokenVariable, label: string) => {
  const chip = figma.createRectangle()
  chip.resize(SWATCH, 64)
  chip.fills = [paintOf(variableOf(context, token.id))]
  chip.strokes = [paintOf(variableOf(context, 'Color/border'))]
  chip.strokeAlign = 'INSIDE'
  bindRadius(chip, variableOf(context, 'Radius/radius-lg'))
  return tile(context, token.name, chip, [label, token.code])
}

const colorBoard = async (context: Context, payload: TokenPayload) => {
  const colors = payload.variables.filter((token) => token.collection === 'Color')
  return [grid('swatches', await sequence(colors, (token) => colorTile(context, token, token.name)))]
}

const toneBoard = async (context: Context, payload: TokenPayload) => {
  const tones = payload.variables.filter((token) => token.collection === 'Tone')
  const groups = [...new Set(tones.map((token) => token.name.split('/')[0]))]
  return sequence(groups, async (group) => {
    const members = tones.filter((token) => token.name.startsWith(`${group}/`))
    const row = stack(group, 'VERTICAL', 12)
    row.appendChild(await title(context, group))
    row.appendChild(
      grid(
        'swatches',
        await sequence(members, (token) => colorTile(context, token, token.name.slice(group.length + 1))),
      ),
    )
    return row
  })
}

const radiusBoard = async (context: Context, payload: TokenPayload) => {
  const radii = payload.variables.filter((token) => token.collection === 'Radius')
  const tiles = await sequence(radii, (token) => {
    const square = figma.createRectangle()
    square.resize(96, 96)
    square.fills = [paintOf(variableOf(context, 'Color/muted'))]
    bindRadius(square, variableOf(context, token.id))
    const alias = aliasOf(token.value)
    return tile(context, token.name, square, [token.name, alias ? `= ${alias.split('/').pop()}` : `${token.value}px`])
  })
  return [grid('radii', tiles)]
}

const typographyBoard = (context: Context, payload: TokenPayload) =>
  sequence(payload.textStyles, (token) =>
    textOf(
      `${token.name} · ${token.fontSize}/${token.lineHeight} · ${token.fontWeight}`,
      required(context.textStyles, token.id),
      variableOf(context, 'Color/foreground'),
    ),
  )

const shadowBoard = async (context: Context, payload: TokenPayload) => {
  const tiles = await sequence(payload.effectStyles, async (token) => {
    const card = figma.createRectangle()
    card.resize(SWATCH, 96)
    card.fills = [paintOf(variableOf(context, 'Color/card'))]
    bindRadius(card, variableOf(context, 'Radius/radius-lg'))
    await card.setEffectStyleIdAsync(required(context.effectStyles, token.id).id)
    return tile(context, token.name, card, [token.name])
  })
  return [grid('shadows', tiles)]
}

export const drawBoards = async (page: PageNode, payload: TokenPayload, context: Context, report: SyncReport) => {
  await page.loadAsync()
  await loadFonts([...context.textStyles.values()])
  const boards: [string, () => Promise<SceneNode[]>][] = [
    ['Color', () => colorBoard(context, payload)],
    ['Tone', () => toneBoard(context, payload)],
    ['Radius', () => radiusBoard(context, payload)],
    ['Typography', () => typographyBoard(context, payload)],
    ['Shadows', () => shadowBoard(context, payload)],
  ]
  let top = 0
  for (const [name, content] of boards) {
    const section = boardSection(page, name, { x: 0, y: top }, report)
    for (const child of [...section.children]) child.remove()
    const frame = stack('board', 'VERTICAL', 32, 48)
    frame.fills = [paintOf(variableOf(context, 'Color/background'))]
    frame.appendChild(
      await textOf(name, required(context.textStyles, 'Text/headline/sm'), variableOf(context, 'Color/foreground')),
    )
    for (const node of await content()) frame.appendChild(node)
    section.appendChild(frame)
    frame.x = 80
    frame.y = 80
    section.resizeWithoutConstraints(frame.width + 160, frame.height + 160)
    section.x = 0
    section.y = top
    top += section.height + BOARD_GAP
  }
}
