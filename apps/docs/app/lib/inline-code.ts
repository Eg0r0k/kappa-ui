export type InlinePart = { code: boolean; text: string }

export const inlineCode = (text: string): InlinePart[] => {
  const pieces = text.split('`')
  if (pieces.length % 2 === 0) return [{ code: false, text }]
  return pieces.flatMap((piece, index) => (piece === '' ? [] : [{ code: index % 2 === 1, text: piece }]))
}
