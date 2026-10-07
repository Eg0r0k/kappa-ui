import { useMounted } from '@vueuse/core'
import { createContext } from 'reka-ui'

import { DEMO_WIDTH, clampWidth, neighbourExample, selectedExample } from '~/lib/demo'
import type { PageExample } from '~/lib/outline'
import type { ColorScheme, Direction, Tone } from '~/lib/preview-protocol'

export type DemoScheme = 'site' | ColorScheme

type DemoSource = {
  examples: () => readonly PageExample[]
  pageSlug: () => string
  component: () => string | undefined
}

const createDemo = (source: DemoSource) => {
  const route = useRoute()
  const router = useRouter()
  const colorMode = useColorMode()
  const mounted = useMounted()
  const cookie = useCookie<number>('kappa-docs-demo-width', {
    default: () => DEMO_WIDTH.initial,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

  const examples = computed(() => source.examples())
  const component = computed(() => source.component())
  const active = computed(() => examples.value.length > 0)
  const selected = computed(() => selectedExample(examples.value, mounted.value ? route.hash : '', source.pageSlug()))
  const index = computed(() => (selected.value ? examples.value.indexOf(selected.value) : -1))
  const previous = computed(() => neighbourExample(examples.value, selected.value, -1))
  const next = computed(() => neighbourExample(examples.value, selected.value, 1))

  const quietly = (hash: string) => router.replace({ query: route.query, hash, state: { demo: true } })
  const select = (slug: string) => quietly(`#${slug}`)

  const scheme = ref<DemoScheme>('site')
  const colorScheme = computed<ColorScheme>(() => {
    if (scheme.value !== 'site') return scheme.value
    return colorMode.value === 'dark' ? 'dark' : 'light'
  })
  const dir = ref<Direction>('ltr')
  const color = ref<Tone>('primary')
  const inspect = ref(false)
  const restart = ref(0)
  const open = ref(false)
  const expanded = ref(false)
  const resizing = ref(false)
  const width = ref(clampWidth(cookie.value))

  const commitWidth = () => {
    cookie.value = width.value
  }

  const show = (slug: string, expand = false) => {
    select(slug)
    open.value = true
    expanded.value = expand
  }

  const close = () => {
    open.value = false
    expanded.value = false
    quietly('')
  }

  const enter = () => {
    const slug = decodeURIComponent(route.hash.replace(/^#/, ''))
    open.value = examples.value.some((example) => example.slug === slug)
    expanded.value = false
  }

  onMounted(enter)
  watch([() => route.path, examples], enter)

  return {
    examples,
    component,
    active,
    selected,
    index,
    previous,
    next,
    select,
    scheme,
    colorScheme,
    dir,
    color,
    inspect,
    restart,
    open,
    show,
    close,
    expanded,
    resizing,
    width,
    commitWidth,
  }
}

export type Demo = ReturnType<typeof createDemo>

export const [injectDemo, provideDemoContext] = createContext<Demo>('DocsLayout')

export const provideDemo = (source: DemoSource) => provideDemoContext(createDemo(source))
