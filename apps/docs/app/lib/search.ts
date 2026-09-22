export type SearchSection = { id: string; title: string; titles: string[]; level: number; content: string }

const scoreTerm = (term: string, title: string, trail: string, content: string) => {
  if (title.startsWith(term)) return 4
  if (title.includes(term)) return 3
  if (trail.includes(term)) return 2
  if (content.includes(term)) return 1
  return 0
}

export const searchSections = (sections: readonly SearchSection[], query: string, limit = 12) => {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return []

  return sections
    .flatMap((section) => {
      const title = section.title.toLowerCase()
      const trail = section.titles.join(' ').toLowerCase()
      const content = section.content.toLowerCase()
      let score = 0
      for (const term of terms) {
        const termScore = scoreTerm(term, title, trail, content)
        if (termScore === 0) return []
        score += termScore
      }
      return [{ section, score }]
    })
    .sort((a, b) => b.score - a.score || a.section.level - b.section.level)
    .slice(0, limit)
    .map((hit) => hit.section)
}
