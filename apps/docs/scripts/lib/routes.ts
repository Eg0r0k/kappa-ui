export const contentFileToRoute = (file: string) => {
  const segments = file
    .replaceAll('\\', '/')
    .replace(/\.md$/, '')
    .split('/')
    .map((segment) => segment.replace(/^\d+\./, ''))
  if (segments.at(-1) === 'index') segments.pop()
  return ['/docs', ...segments].join('/')
}
