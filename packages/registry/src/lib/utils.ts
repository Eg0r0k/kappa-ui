import { type ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

const typescale = ['display', 'headline', 'title', 'body', 'label'].flatMap((role) =>
  ['lg', 'md', 'sm'].map((size) => `${role}-${size}`),
)

const twMerge = extendTailwindMerge({ extend: { theme: { text: typescale } } })

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))
